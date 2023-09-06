import {useApp, useInput} from 'ink';
import {useDispatch, useSelector} from 'react-redux';
import {
	addCommand,
	deleteCommand,
	inputCharacter,
	inputDelete,
	nextCommand,
	previousCommand,
	setInitial,
	setInputMode,
} from './store.js';

export const useInputHandler = () => {
	const dispatch = useDispatch();
	const {newCommand, inputMode} = useSelector(({root}) => root);

	const {exit} = useApp();

	useInput((input, key) => {
		// both modes: handle scroll with arrow keys and ctrl-[n/p]
		if ((key.ctrl && input === 'n') || key.downArrow) {
			dispatch(nextCommand());
			return;
		}
		if ((key.ctrl && input === 'p') || key.upArrow) {
			dispatch(previousCommand());
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
				dispatch(nextCommand());
				break;
			case 'k': // scroll up (unless in the middle of typing new command)
				dispatch(previousCommand());
				break;
			case 'q': // quit app
				exit();
				break;
		}
	});
};
