import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import {
	countSeats,
	displaySeats,
	findAdjacentSeats,
	initializeSeats,
	reserveSeat,
} from "./seating";

function parseCoordinate(value: string): number | null {
	const trimmed = value.trim();
	if (!/^\d+$/.test(trimmed)) {
		return null;
	}

	const coordinate = Number(trimmed);
	return Number.isSafeInteger(coordinate) ? coordinate : null;
}

async function runInteractive(): Promise<void> {
	const seats = initializeSeats();
	const input = createInterface({ input: stdin, output: stdout });
	const rowCount = seats.length;
	const seatCount = seats[0]?.length ?? 0;
	let running = true;

	try {
		while (running) {
			console.log("\nCinema seat manager");
			console.log("1. Show seating plan");
			console.log("2. Reserve a seat");
			console.log("3. Find two seats together");
			console.log("4. Show availability");
			console.log("5. Quit");
			const choice = (await input.question("Choose an option: ")).trim();

			switch (choice) {
				case "1":
					displaySeats(seats);
					break;
				case "2": {
					const row = parseCoordinate(
						await input.question(`Row (1-${rowCount}): `),
					);
					const seat = parseCoordinate(
						await input.question(`Seat (1-${seatCount}): `),
					);

					if (row === null || seat === null) {
						console.log("Enter whole-number row and seat coordinates.");
					} else {
						console.log(reserveSeat(seats, row, seat));
					}
					break;
				}
				case "3": {
					const pair = findAdjacentSeats(seats);
					if (pair === null) {
						console.log("No adjacent seats are available.");
						break;
					}

					const [first, second] = pair;
					console.log(
						`Available together: row ${first[0]}, seats ${first[1]} and ${second[1]}.`,
					);
					const confirmation = (
						await input.question("Reserve these seats? (y/N): ")
					)
						.trim()
						.toLowerCase();

					if (confirmation === "y") {
						console.log(reserveSeat(seats, first[0], first[1]));
						console.log(reserveSeat(seats, second[0], second[1]));
					} else {
						console.log("Pair not reserved.");
					}
					break;
				}
				case "4": {
					const [reserved, available] = countSeats(seats);
					console.log(`${available} available, ${reserved} reserved.`);
					break;
				}
				case "5":
					running = false;
					break;
				default:
					console.log("Choose an option from 1 to 5.");
			}
		}
	} finally {
		input.close();
	}
}

void runInteractive();