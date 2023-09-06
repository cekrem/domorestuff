import {useApp, useInput} from 'ink';
import {useDispatch, useSelector} from 'react-redux';
import {
	addCommand,
	deleteCommand,
	inputCharacter,
	inputDelete,
	setActive,
	setInitial,
	setInputMode,
} from './store.js';

export const useInputHandler = () => {
	const dispatch = useDispatch();
	const {commands, newCommand, activeCommand, inputMode} = useSelector(
		({root}) => root,
	);

	const selectCommand = position => {
		const firstId = commands[position === -1 ? commands.length - 1 : 0]?.id; // TODO: flip? that allows going around
		if (!activeCommand) {
			return setActive(firstId);
		} else {
			const currentActiveIndex = commands.findIndex(
				cmd => cmd.id === activeCommand,
			);
			return setActive(commands[currentActiveIndex + position]?.id || firstId);
		}
	};

	const selectNext = () => selectCommand(1);
	const selectPrevious = () => selectCommand(-1);

	const {exit} = useApp();

	useInput((input, key) => {
		// both modes: handle scroll with arrow keys and ctrl-[n/p]
		if ((key.ctrl && input === 'n') || key.downArrow) {
			dispatch(selectNext());
			return;
		}
		if ((key.ctrl && input === 'p') || key.upArrow) {
			dispatch(selectPrevious());
			return;
		}

		// input mode: handle adding command
		if (inputMode) {
			if (key.backspace || key.delete) {
				dispatch(inputDelete());
				return;
			}
			if (key.return && newCommand.length) {
				dispatch(addCommand(newCommand));
				return;
			}

			dispatch(inputCharacter(input));
			return;
		}

		// handle everything else (when not entering a new command)
		switch (input) {
			case 'n': // new command
				dispatch(setInputMode(true));
				break;
			case 'd': // delete command
				dispatch(deleteCommand());
				break;
			case 'c': // clear all commands
				dispatch(setInitial([]));
				break;
			case 'j': // scroll down (unless in the middle of typing new command)
				dispatch(selectNext());
				break;
			case 'k': // scroll up (unless in the middle of typing new command)
				dispatch(selectPrevious());
				break;
			case 'q': // quit app
				exit();
				break;
		}
	});
};
