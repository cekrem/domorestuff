#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import App from './app.js';

const cli = meow(
  `
		Usage
		  $ dms "echo first command" "echo second command"
			(the arguments are optional, you can also do stuff _after_ starting domorestuff)
	`,
  {
    importMeta: import.meta,
  },
);

const enterAltScreenCommand = '\x1b[?1049h';
const leaveAltScreenCommand = '\x1b[?1049l';
process.stdout.write(enterAltScreenCommand);
process.on('exit', () => {
  process.stdout.write(leaveAltScreenCommand);
});

render(<App commands={cli.input} />);
