import {spawn} from 'child_process';
import {Box, Spacer, Text} from 'ink';
import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {COLORS, setCommandProp} from './store.js';

export const Command = ({id, active}) => {
	const dispatch = useDispatch();
	const {raw, root, args, status, output, error, color} = useSelector(
		({root}) => root.commands[id],
	);

	const [setStatus, setColor, setOutput] = ['status', 'color', 'output'].map(
		prop => value =>
			dispatch(
				setCommandProp({
					id,
					key: prop,
					value,
				}),
			),
	);

	useEffect(() => {
		const startTime = Date.now();
		const elapsedTime = () => Date.now() - startTime;

		const tick = setInterval(() => {
			const tickerTimeRounded = Math.floor(elapsedTime() / 1000);
			setStatus(
				`running for ${tickerTimeRounded.toString().padStart(2, '0')}s ${
					spinner[tickerTimeRounded % spinner.length]
				}`,
			);
		}, 1000);

		const [ps, job] = runCommand(root, args, setOutput);
		job.then(exitCode => {
			clearInterval(tick);
			setColor(!exitCode ? COLORS.success : COLORS.error);
			setStatus(parseClose(!exitCode, elapsedTime()));
		});

		return () => {
			clearInterval(id);
			ps.kill();
		};
	}, [id]);

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
					{' '}
					{`${active ? '* ' : ''}${raw}`}
					{!active && output?.length > 1 && <Text dimColor> (...)</Text>}
				</Text>

				<Spacer />

				<Text color={color}>{status}</Text>
			</Box>

			{active && output?.length > 1 && (
				<Box marginTop="1" overflow="hidden">
					<Text overflow="scroll" wrap="truncate">
						{output}
					</Text>
				</Box>
			)}
		</Box>
	);
};

const parseClose = (success, elapsedTime) =>
	`${success ? 'finished in' : 'failed after'} ${elapsedTime}ms`;
const spinner = ['.  ', '.. ', '...', ' ..', '  .', '   '];

const runCommand = (command, args, onOutput) => {
	const ps = spawn(command, args);
	const outputChunks = [];
	const errorChunks = [];

	const parseOutput = () => {
		const output = outputChunks.toString().trim();
		const error = errorChunks.toString().trim();

		onOutput(output && error ? `${output}; error: ${error}` : output || error);
	};

	const handleOutput = buffer => {
		outputChunks.push(buffer);
		parseOutput();
	};

	const handleError = buffer => {
		errorChunks.push(buffer);
		parseOutput();
	};

	const job = new Promise((resolve, _) => {
		ps.on('close', resolve);
		ps.on('error', () => {});
		ps.stdout.on('data', handleOutput);
		ps.stderr.on('data', handleError);
	});

	return [ps, job];
};
