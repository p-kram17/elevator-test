import type { Direction, Person } from "./types";

export class FloorQueue {
  private personStore: Person[] = [];

  add(person: Person): void {
    this.personStore.push(person);
  }

  getAll(): Person[] {
    return [...this.personStore];
  }

  getByDirection(direction: Direction): Person[] {
    return this.personStore.filter((person) => person.direction === direction);
  }

  remove(personId: number): void {
    this.personStore = this.personStore.filter(
      (person) => person.id !== personId,
    );
  }

  hasAny(): boolean {
    return this.personStore.length > 0;
  }

  hasDirection(direction: Direction): boolean {
    return this.personStore.some((person) => person.direction === direction);
  }
}
