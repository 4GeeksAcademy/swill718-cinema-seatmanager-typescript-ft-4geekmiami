export type Seating = (0 | 1)[][];
export type Position = [row: number, seat: number];

// Create independent rows so reserving one seat cannot change another row.
export function initializeSeats(): Seating {
  const seats: Seating = [];
  for (let row = 0; row < 8; row++) {
    seats.push(Array<0 | 1>(10).fill(0));
  }
  return seats;
}

// Print the room with staff-facing, one-based row and seat numbers.
export function displaySeats(seats: Seating): void {
  console.log("Seat  1 2 3 4 5 6 7 8 9 10");
  for (let row = 0; row < seats.length; row++) {
    console.log(`Row ${row + 1} ${seats[row].map((seat) => seat === 1 ? "X" : "L").join(" ")}`);
  }
  console.log("L = available | X = reserved");
}

// Reject invalid or occupied seats before changing the matrix.
export function reserveSeat(seats: Seating, row: number, seat: number): string {
  if (!Number.isInteger(row) || !Number.isInteger(seat) ||
      row < 1 || row > seats.length || seat < 1 || seat > (seats[row - 1]?.length ?? 0)) {
    return "Invalid seat. Choose a row from 1 to 8 and a seat from 1 to 10.";
  }
  if (seats[row - 1][seat - 1] === 1) {
    return `Row ${row}, seat ${seat} is already reserved.`;
  }
  seats[row - 1][seat - 1] = 1;
  return `Reserved row ${row}, seat ${seat}.`;
}

// Count occupied and available seats directly from the matrix.
export function countSeats(seats: Seating): [occupied: number, available: number] {
  let occupied = 0;
  let available = 0;
  for (const row of seats) {
    for (const seat of row) {
      if (seat === 1) occupied++;
      else available++;
    }
  }
  return [occupied, available];
}

// Return the first horizontal pair without reserving or crossing rows.
export function findAdjacentSeats(seats: Seating): [Position, Position] | null {
  for (let row = 0; row < seats.length; row++) {
    for (let seat = 0; seat < seats[row].length - 1; seat++) {
      if (seats[row][seat] === 0 && seats[row][seat + 1] === 0) {
        return [[row + 1, seat + 1], [row + 1, seat + 2]];
      }
    }
  }
  return null;
}