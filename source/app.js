import React from 'react';
import {Text} from 'ink';
import {Command} from './command.js';
import {useInputHandler} from './inputHandlerHook.js';

export default ({commands: initialCommands = []}) => {
	const [commands, activeIndex, newCmd] = useInputHandler(initialCommands);

	return (
		<>
			<Text>
				{newCmd ||
					"Press 'n' to do new stuff, 'd' to delete stuff (pending processes will be killed!), 'c' to delete and kill everything, and 'q' to quit."}
			</Text>
			<Text>
				Select next/previous command by using arrow keys, j/k or CTRL-n/p.
			</Text>
			{commands.map((cmd, i) => (
				<Command key={cmd} cmd={cmd} active={activeIndex === i} />
			))}
			{!commands.length && <Text>(no commands added)</Text>}
		</>
	);
};
