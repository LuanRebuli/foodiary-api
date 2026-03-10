import { Saga } from "@application/contracts/Saga";
import { describe, expect, it, vi } from "vitest";

describe("Saga", () => {
  it("should execute all steps in order", async () => {
    const order: number[] = [];
    const saga = new Saga();

    saga.addStep({
      execute: async () => {
        order.push(1);
      },
    });
    saga.addStep({
      execute: async () => {
        order.push(2);
      },
    });
    saga.addStep({
      execute: async () => {
        order.push(3);
      },
    });

    await saga.execute();

    expect(order).toEqual([1, 2, 3]);
  });

  it("should compensate completed steps in reverse order when a step fails", async () => {
    const order: string[] = [];
    const saga = new Saga();

    saga.addStep({
      execute: async () => {
        order.push("exec-1");
      },
      compensate: async () => {
        order.push("comp-1");
      },
    });

    saga.addStep({
      execute: async () => {
        order.push("exec-2");
      },
      compensate: async () => {
        order.push("comp-2");
      },
    });

    saga.addStep({
      execute: async () => {
        throw new Error("step 3 failed");
      },
      compensate: async () => {
        order.push("comp-3");
      },
    });

    await expect(saga.execute()).rejects.toThrow("step 3 failed");

    expect(order).toEqual(["exec-1", "exec-2", "comp-2", "comp-1"]);
  });

  it("should not compensate steps without a compensate function", async () => {
    const order: string[] = [];
    const saga = new Saga();

    saga.addStep({
      execute: async () => {
        order.push("exec-1");
      },
    });

    saga.addStep({
      execute: async () => {
        order.push("exec-2");
      },
      compensate: async () => {
        order.push("comp-2");
      },
    });

    saga.addStep({
      execute: async () => {
        throw new Error("failed");
      },
    });

    await expect(saga.execute()).rejects.toThrow("failed");

    expect(order).toEqual(["exec-1", "exec-2", "comp-2"]);
  });

  it("should not compensate if the first step fails", async () => {
    const compensate = vi.fn();
    const saga = new Saga();

    saga.addStep({
      execute: async () => {
        throw new Error("first step failed");
      },
      compensate,
    });

    await expect(saga.execute()).rejects.toThrow("first step failed");

    expect(compensate).not.toHaveBeenCalled();
  });

  it("should work with no steps", async () => {
    const saga = new Saga();
    await expect(saga.execute()).resolves.toBeUndefined();
  });
});
