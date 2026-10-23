import { Armchair, ArrowRight, Check, Clapperboard, createElement, Ticket, Users, X } from "lucide";
import { countSeats, displaySeats, findAdjacentSeats, initializeSeats, reserveSeat } from "./seating";
import type { Position, Seating } from "./seating";

// Connect browser controls to one shared seating matrix.
function initializeInterface(): void {
  const seats = initializeSeats();
  let selected: Position[] = [];
  const map = document.querySelector<HTMLDivElement>("#seat-map")!;
  const reserve = document.querySelector<HTMLButtonElement>("#reserve")!;
  const pair = document.querySelector<HTMLButtonElement>("#find-pair")!;
  const clear = document.querySelector<HTMLButtonElement>("#clear")!;
  const status = document.querySelector<HTMLParagraphElement>("#status")!;
  const summary = document.querySelector<HTMLParagraphElement>("#selection")!;
  const buttons: HTMLButtonElement[][] = [];

  document.querySelector("#brand-icon")!.append(createElement(Clapperboard));
  document.querySelector("#pair-icon")!.append(createElement(Users));
  document.querySelector("#reserve-icon")!.append(createElement(ArrowRight));
  clear.prepend(createElement(X));

  for (let row = 1; row <= 8; row++) {
    const rowLabel = document.createElement("span");
    rowLabel.className = "row-label";
    rowLabel.textContent = String(row);
    rowLabel.setAttribute("aria-hidden", "true");
    map.append(rowLabel);
    const rowButtons: HTMLButtonElement[] = [];
    for (let seat = 1; seat <= 10; seat++) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "seat";
      button.dataset.row = String(row);
      button.dataset.seat = String(seat);
      button.append(createElement(Armchair));
      const number = document.createElement("span");
      number.className = "seat-number";
      number.textContent = String(seat);
      button.append(number);
      button.addEventListener("click", () => {
        if (seats[row - 1][seat - 1] === 1) return;
        const alreadySelected = selected.some(([selectedRow, selectedSeat]) => selectedRow === row && selectedSeat === seat);
        selected = alreadySelected ? [] : [[row, seat]];
        status.textContent = "";
        render();
      });
      rowButtons.push(button);
      map.append(button);
    }
    buttons.push(rowButtons);
  }

  // Update existing buttons in place to preserve keyboard focus.
  function render(): void {
    const [occupied, available] = countSeats(seats);
    document.querySelector("#available-count")!.textContent = String(available);
    document.querySelector("#reserved-count")!.textContent = String(occupied);
    document.querySelector("#occupancy-label")!.textContent = `${occupied} of 80 reserved`;
    document.querySelector<HTMLProgressElement>("#occupancy")!.value = occupied;
    document.querySelector("#selection-count")!.textContent = String(selected.length).padStart(2, "0");
    for (let row = 1; row <= 8; row++) {
      for (let seat = 1; seat <= 10; seat++) {
        const button = buttons[row - 1][seat - 1];
        const occupied = seats[row - 1][seat - 1] === 1;
        const active = selected.some(([selectedRow, selectedSeat]) => selectedRow === row && selectedSeat === seat);
        const state = occupied ? "reserved" : active ? "selected" : "available";
        button.dataset.state = state;
        button.setAttribute("aria-label", `Row ${row}, seat ${seat}, ${state}`);
        button.setAttribute("aria-pressed", String(active));
        button.setAttribute("aria-disabled", String(occupied));
        button.title = `Row ${row} / Seat ${seat} - ${state}`;
        button.querySelector("svg")!.replaceWith(createElement(occupied ? X : active ? Check : Armchair));
      }
    }
    summary.textContent = selected.length
      ? selected.map(([row, seat]) => `Row ${row} / Seat ${seat}`).join(" + ")
      : "No seats selected";
    reserve.disabled = selected.length === 0;
    clear.disabled = selected.length === 0;
    pair.disabled = available === 0;
    document.querySelector("#reserve-label")!.textContent = selected.length === 2 ? "Reserve 2 seats" : "Reserve seat";
  }

  pair.addEventListener("click", () => {
    const found = findAdjacentSeats(seats);
    selected = found ?? [];
    status.textContent = found ? "Two seats together selected. Ready to reserve." : "No two seats together are available.";
    render();
  });
  clear.addEventListener("click", () => {
    selected = [];
    status.textContent = "Selection cleared.";
    render();
    pair.focus();
  });
  reserve.addEventListener("click", () => {
    if (selected.length === 0) return;
    if (selected.some(([row, seat]) => seats[row - 1][seat - 1] !== 0)) {
      selected = [];
      status.textContent = "These seats are no longer available. Please choose again.";
      render();
      return;
    }
    const confirmation = selected.map(([row, seat]) => reserveSeat(seats, row, seat)).join(" ");
    selected = [];
    render();
    status.textContent = confirmation;
    const nextAvailable = buttons.flat().find((button) => button.dataset.state === "available");
    if (nextAvailable) nextAvailable.focus();
    else buttons[0][0].focus();
  });
  document.querySelector("#selection-icon")!.append(createElement(Ticket));
  render();
}

// Show the four assignment scenarios when the entry point runs in a terminal.
function runDemo(): void {
  const empty = initializeSeats();
  const partial = initializeSeats();
  const scattered = initializeSeats();
  const full = initializeSeats();
  console.log(reserveSeat(partial, 1, 1));
  console.log(reserveSeat(partial, 1, 1));
  console.log(reserveSeat(partial, 0, 1));
  for (let row = 1; row <= 8; row++) {
    for (let seat = 1; seat <= 10; seat++) {
      reserveSeat(full, row, seat);
      if (seat % 2 === 0) reserveSeat(scattered, row, seat);
    }
  }
  const rooms: Seating[] = [empty, partial, scattered, full];
  const labels = ["Empty room", "Partial reservations", "Scattered singles", "Full room"];
  for (let index = 0; index < rooms.length; index++) {
    console.log(`\n${labels[index]}`);
    displaySeats(rooms[index]);
    const [occupied, available] = countSeats(rooms[index]);
    console.log(`Reserved: ${occupied} | Available: ${available}`);
    const adjacent = findAdjacentSeats(rooms[index]);
    console.log(adjacent ? `First pair: ${adjacent.map(([row, seat]) => `row ${row}, seat ${seat}`).join(" + ")}` : "No adjacent seats available.");
  }
}

if (typeof document !== "undefined") {
  void import("./style.css").then(initializeInterface);
} else {
  runDemo();
}
