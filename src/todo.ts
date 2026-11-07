/** Thrown by the workshop stubs so the UI can tell you which step to do next. */
export class TodoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TodoError";
  }
}
