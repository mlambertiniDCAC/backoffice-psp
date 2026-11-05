import { describe, it, expect, vi, beforeAll } from "vitest";
import { configureStore } from "@reduxjs/toolkit";

vi.mock("src/lib/api/auth", () => ({
  loginAdmin: vi.fn(),
  cerrarSesion: vi.fn(),
  refrescarSesion: vi.fn(),
}));

let reducer;
let login;
let loginAdmin;

beforeAll(async () => {
  const slice = await import("../authSlice");
  reducer = slice.default;
  login = slice.login;
  ({ loginAdmin } = await import("src/lib/api/auth"));
});

const arme = () => configureStore({ reducer: { auth: reducer } });

describe("login", () => {
  it("guarda el token de una respuesta que solo trae token", async () => {
    loginAdmin.mockResolvedValueOnce({ token: "opaco-123" });
    const store = arme();

    await store.dispatch(login({ mail: "admin@mailnesia.com", password: "x" }));

    expect(store.getState().auth.token).toBe("opaco-123");
  });

  it("manda el campo mail, no email", async () => {
    loginAdmin.mockResolvedValueOnce({ token: "t" });
    const store = arme();

    await store.dispatch(
      login({ mail: "admin@mailnesia.com", password: "secreta" })
    );

    expect(loginAdmin).toHaveBeenCalledWith("admin@mailnesia.com", "secreta");
  });

  it("deja un mensaje propio cuando el login responde 429", async () => {
    loginAdmin.mockRejectedValueOnce({ response: { status: 429 } });
    const store = arme();

    await store.dispatch(login({ mail: "a@b.com", password: "x" }));

    expect(store.getState().auth.error).toMatch(/l[íi]mite es global/i);
    expect(store.getState().auth.token).toBeNull();
  });
});
