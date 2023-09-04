import React, {useEffect, useState} from 'react';
import {Box, Spacer, Text} from 'ink';
import {spawn} from 'child_process';

export const Command = ({cmd, active}) => {
	const [summary, setSummary] = useState('');
	const [color, setColor] = useState(COLORS.pending);
	const [output, setOutput] = useState(null);

	useEffect(() => {
		const startTime = Date.now();
		const elapsedTime = () => Date.now() - startTime;
		const elapsedTimeRounded = () => Math.floor(elapsedTime() / 1000);

		const tick = setInterval(() => {
			setColor(prev =>
				prev === COLORS.pending ? COLORS.pendingAlternate : COLORS.pending,
			);
			setSummary(
				`running... ${spinner[elapsedTimeRounded() % spinner.length]}`,
			);
		}, 500);

		const [cleanCmd, ...args] = cmd.includes(' ') ? cmd.split(' ') : [cmd];
		const ps = spawn(cleanCmd, args);

		const handleResult = exitCodeOrError => {
			const success = exitCodeOrError === 0;
			clearInterval(tick);
			setColor(success ? COLORS.success : COLORS.error);
			setSummary(parseClose(success, elapsedTime()));
		};

		ps.on('close', handleResult);
		ps.on('error', handleResult);
		ps.stdout.on('data', setOutput);
		ps.stderr.on('data', setOutput);

		return () => {
			clearInterval(tick);
			ps.kill();
		};
	}, [cmd]);

	return (
		<Box
			overflow="hidden"
			flexDirection="column"
			width="100%"
			borderStyle="bold"
			borderColor={color}
		>
			<Box>
				<Text bold>
					{`${active ? '* ' : ''}${cmd}`}
					{!active && output?.length > 1 && <Text dimColor> (...)</Text>}
				</Text>

				<Spacer />

				<Text color={color}>{summary}</Text>
			</Box>

			{active && output?.length > 1 && (
				<Box marginTop="1" overflow="hidden">
					<Text overflow="hidden" wrap="truncate">
						{output.toString().trim()}
					</Text>
				</Box>
			)}
		</Box>
	);
};
const parseClose = (success, elapsedTime) =>
	`${success ? 'finished in' : 'failed after'} ${elapsedTime}ms`;
const spinner = ['|', '/', '-', '\\'];

const COLORS = {
	success: 'green',
	error: 'red',
	pending: 'black',
	pendingAlternate: 'blueBright',
};
