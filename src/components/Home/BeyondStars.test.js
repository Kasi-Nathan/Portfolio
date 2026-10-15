import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BeyondStars, { instrumentsFor } from "./BeyondStars";
import skills from "../../data/skills.json";

let originalObserver;

beforeEach(() => {
  originalObserver = global.IntersectionObserver;
});

afterEach(() => {
  global.IntersectionObserver = originalObserver;
});

test("story, education, portrait, and instruments use the existing content sources", () => {
  global.IntersectionObserver = undefined;
  render(<MemoryRouter><BeyondStars /></MemoryRouter>);
  expect(screen.getByRole("heading", { name: "Beyond the stars." })).toBeInTheDocument();
  expect(screen.getByText("A little about the person building this universe.")).toBeInTheDocument();
  expect(screen.getByText(/Sri Krishna College of Technology/)).toBeInTheDocument();
  expect(screen.getByText(/University of Bayreuth/)).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "Kasi Nathan Murugan" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Instruments." })).toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(skills.technologies.length + skills.tools.length);
  expect(instrumentsFor(["react", "python"]).map(skill => skill.name)).toEqual(["React", "Python"]);
});

test("scroll reveals are permanent and the observer is released on unmount", () => {
  const observe = jest.fn();
  const unobserve = jest.fn();
  const disconnect = jest.fn();
  let notify;
  global.IntersectionObserver = jest.fn(callback => {
    notify = callback;
    return { observe, unobserve, disconnect };
  });
  const view = render(<MemoryRouter><BeyondStars /></MemoryRouter>);
  const first = observe.mock.calls[0][0];
  notify([{ target: first, isIntersecting: true }]);
  expect(first).toHaveClass("is-visible");
  expect(unobserve).toHaveBeenCalledWith(first);
  notify([{ target: first, isIntersecting: false }]);
  expect(first).toHaveClass("is-visible");
  view.unmount();
  expect(disconnect).toHaveBeenCalledTimes(1);
});
