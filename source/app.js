import React, {useEffect} from 'react';
import {Text} from 'ink';
import {Command} from './command.js';
import {useDispatch, useSelector} from 'react-redux';
import {setInitial} from './store.js';
import {useInputHandler} from './inputHandlerHook.js';

export default ({commands: initialCommands = []}) => {
	const dispatch = useDispatch();
	useInputHandler();
	const {commands, inputMode, newCommand} = useSelector(({root}) => root);

	useEffect(() => {
		dispatch(setInitial(initialCommands));
	}, [false]);

	return (
		<>
			<Text>
				{inputMode
					? `$ ${newCommand}`
					: "Press 'n' to do new stuff, 'd' to delete stuff (pending processes will be killed!), 'c' to delete and kill everything, and 'q' to quit."}
			</Text>
			<Text>
				Select next/previous command by using arrow keys, j/k or CTRL-n/p.
			</Text>
			{commands.map(({id}) => (
				<Command key={id} id={id} />
			))}
			{!commands.length && <Text>(no commands added)</Text>}
		</>
	);
};
