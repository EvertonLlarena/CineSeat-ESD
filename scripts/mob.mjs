#!/usr/bin/env node
// Mob programming helper for a shared machine.
// Sets the commit author (the "driver") in the local git config and keeps track of who is
// present, so every commit is authored by the driver and co-authored by the other members.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const USAGE = `Usage:
  pnpm mob                      Show the current driver and co-authors
  pnpm mob <driver> [ids...]    Set the driver; optionally list who is present (default: everyone)
  pnpm mob trailers             Print Co-authored-by trailers for the current session
  pnpm mob off                  Clear the session (removes the local author config)`;

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

const gitOrEmpty = (...args) => {
  try {
    return git(...args);
  } catch {
    return '';
  }
};

const fail = (message) => {
  console.error(`mob: ${message}`);
  process.exit(1);
};

const root = git('rev-parse', '--show-toplevel');
const statePath = resolve(process.cwd(), git('rev-parse', '--git-path', 'cineseat-mob.json'));
const { members } = JSON.parse(readFileSync(join(root, '.github', 'team.json'), 'utf8'));
const membersById = new Map(members.map((member) => [member.id, member]));

const findMember = (id) => {
  const member = membersById.get(id.toLowerCase());
  if (!member) fail(`unknown member "${id}". Valid ids: ${[...membersById.keys()].join(', ')}`);
  return member;
};

const readState = () => (existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')) : null);

const currentDriver = () => {
  const email = gitOrEmpty('config', '--local', 'user.email');
  return members.find((member) => member.email === email) ?? null;
};

const coAuthorsOf = (driver) => {
  const presentIds = readState()?.present ?? members.map((member) => member.id);
  return presentIds
    .filter((id) => id !== driver.id)
    .map((id) => membersById.get(id))
    .filter(Boolean);
};

const showStatus = () => {
  const driver = currentDriver();
  if (!driver) {
    console.log('No driver set. Run: pnpm mob <id>');
    return;
  }
  const coAuthors = coAuthorsOf(driver);
  console.log(`Driver:     ${driver.name} <${driver.email}>`);
  console.log(`Co-authors: ${coAuthors.length ? coAuthors.map((m) => m.name).join(', ') : '(none)'}`);
};

const setDriver = (driverId, presentIds) => {
  const driver = findMember(driverId);
  const present = presentIds.length
    ? presentIds.map((id) => findMember(id).id)
    : (readState()?.present ?? members.map((member) => member.id));

  git('config', '--local', 'user.name', driver.name);
  git('config', '--local', 'user.email', driver.email);

  const state = {
    driver: driver.id,
    present: [...new Set([driver.id, ...present])],
    updatedAt: new Date().toISOString(),
  };
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
  showStatus();
};

const [command, ...args] = process.argv.slice(2);

switch (command) {
  case undefined:
    showStatus();
    break;
  case 'help':
  case '--help':
  case '-h':
    console.log(USAGE);
    break;
  case 'off':
    gitOrEmpty('config', '--local', '--unset', 'user.name');
    gitOrEmpty('config', '--local', '--unset', 'user.email');
    rmSync(statePath, { force: true });
    console.log('Mob session cleared.');
    break;
  case 'trailers': {
    const driver = currentDriver();
    if (!driver) fail('no driver set. Run: pnpm mob <id>');
    for (const member of coAuthorsOf(driver)) {
      console.log(`Co-authored-by: ${member.name} <${member.email}>`);
    }
    break;
  }
  default:
    setDriver(command, args);
}
