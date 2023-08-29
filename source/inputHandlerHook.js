import {useState} from 'react';
import {useApp, useInput} from 'ink';

const CMD_PREFIX = '$ ';
export const useInputHandler = initialCommands => {
	const {exit} = useApp();
	const [commands, setCommands] = useState(initialCommands);
	const [activeCommand, setActiveCommand] = useState(0);
	const [newCmd, setNewCmd] = useState(null);

	useInput((input, key) => {
		// handle scroll
		if ((key.ctrl && input === 'n') || key.downArrow) {
			setActiveCommand(prev => Math.min(commands.length - 1, prev + 1));
			return;
		}
		if ((key.ctrl && input === 'p') || key.upArrow) {
			setActiveCommand(prev => Math.max(0, prev - 1));
			return;
		}

		// handle adding commands
		if (newCmd?.length) {
			if (key.backspace || key.delete) {
				setNewCmd(prev => {
					const next = prev?.slice(0, -1);
					return next === CMD_PREFIX ? null : next;
				});
				return;
			}
			if (key.return && newCmd.length > 2) {
				setCommands(prev => [...prev, newCmd.replace(CMD_PREFIX, '')]);
				setNewCmd(null);
				return;
			}

			setNewCmd(prev => prev + input);
			return;
		}

		// handle everything else (when not entering a new command)
		switch (input) {
			case 'n': // new command
				setNewCmd(CMD_PREFIX);
				break;
			case 'd': // delete command
				setCommands(prev => [
					...prev.slice(0, activeCommand),
					...prev.slice(activeCommand + 1),
				]);
				setActiveCommand(prev => Math.max(prev - 1, 0));
				break;
			case 'c': // clear all commands
				setCommands([]);
				setActiveCommand(0);
				break;
			case 'j': // scroll down (unless in the middle of typing new command)
				setActiveCommand(prev => Math.min(commands.length - 1, prev + 1));
				break;
			case 'k': // scroll up (unless in the middle of typing new command)
				setActiveCommand(prev => Math.max(0, prev - 1));
				break;
			case 'q': // quit app
				exit();
				break;
		}
	});

	return [commands, activeCommand, newCmd];
};
