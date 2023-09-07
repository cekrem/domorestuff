import pkg from '@reduxjs/toolkit';
import {v4 as uuidv4} from 'uuid';

const {configureStore, createSlice} = pkg;

export const COLORS = {
	success: 'green',
	error: 'red',
	pending: 'black',
};

const [normal, input, search] = ['normal', 'input', 'search'];
export const MODE = Object.freeze({
	normal,
	input,
	search,
});

const initialState = {
	commands: {},
	newCommand: '',
	activeIndex: 0,
	inputMode: MODE.normal,
};

const parseCommand = raw => {
	const [root, ...args] = raw.includes(' ') ? raw.split(' ') : [raw];
	return {
		id: uuidv4(),
		raw,
		root,
		args,
		color: COLORS.pending,
	};
};

const rootSlice = createSlice({
	name: 'root',
	initialState,
	reducers: {
		setInitial: (_, {payload}) => {
			const commands = payload.map(parseCommand);
			return {
				...initialState,
				commands: commands.reduce(
					(acc, entry) => ({
						...acc,
						[entry.id]: entry,
					}),
					{},
				),
			};
		},
		addCommand: ({commands, ...state}, {payload}) => {
			const command = parseCommand(payload);
			return {
				...state,
				inputMode: MODE.normal,
				newCommand: '',
				commands: {...commands, [command.id]: command},
			};
		},
		nextCommand: ({activeIndex, ...state}) => ({
			...state,
			activeIndex: activeIndex + 1,
		}),
		previousCommand: ({activeIndex, ...state}) => ({
			...state,
			activeIndex: activeIndex - 1,
		}),
		deleteCommand: ({commands, ...state}) => {
			const ids = Object.values(commands).map(({id}) => id);
			const id = ids[state.activeIndex % ids.length];

			const {[id]: _, ...remainingCommands} = commands;
			return {
				...state,
				commands: remainingCommands,
			};
		},
		setInputMode: (state, {payload}) => ({
			...state,
			newCommand: '',
			inputMode: payload,
		}),
		inputCharacter: ({newCommand, ...state}, {payload}) => ({
			...state,
			newCommand: newCommand + payload,
		}),
		inputDelete: ({newCommand, ...state}) => ({
			...state,
			inputMode: newCommand.length ? MODE.input : MODE.normal,
			newCommand: newCommand.slice(0, -1),
		}),
		// set any prop (but only for existing commands)
		setCommandProp: ({commands, ...state}, {payload}) =>
			payload.id in commands
				? {
						...state,
						commands: {
							...commands,
							[payload.id]: {
								...commands[payload.id],
								[payload.key]: payload.value,
							},
						},
				  }
				: {
						...state,
						commands,
				  },
	},
});

export const {
	setInitial,
	addCommand,
	deleteCommand,
	nextCommand,
	previousCommand,
	inputCharacter,
	inputDelete,
	setInputMode,
	setCommandProp,
} = rootSlice.actions;

export const store = configureStore({
	reducer: {
		root: rootSlice.reducer,
	},
});
