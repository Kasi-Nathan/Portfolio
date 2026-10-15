import React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import Projects from "./Projects";
import ProjectDetail from "./ProjectDetail";
import { ProjectWormholeProvider } from "./ProjectWormhole";

function Path() {
  const { pathname } = useLocation();
  return <output data-testid="path">{pathname}</output>;
}
function Harness() {
  return <MemoryRouter initialEntries={["/project"]}><ProjectWormholeProvider><Path /><Routes><Route path="/project" element={<Projects />} /><Route path="/project/:projectId" element={<ProjectDetail />} /></Routes></ProjectWormholeProvider></MemoryRouter>;
}

beforeEach(() => {
  jest.useFakeTimers();
  window.scrollTo = jest.fn();
  window.matchMedia = jest.fn().mockReturnValue({ matches: false });
  window.requestAnimationFrame = callback => setTimeout(callback, 0);
  window.cancelAnimationFrame = clearTimeout;
});
afterEach(() => jest.useRealTimers());

function selectProject() {
  fireEvent.click(screen.getByRole("button", { name: "Select Bone Disease Prediction" }));
  fireEvent.click(screen.getByRole("link", { name: /Explore Project/i }));
}

test("planetary descent covers navigation, then releases the correct detail and focus", () => {
  render(<Harness />);
  selectProject();
  expect(screen.getByTestId("path")).toHaveTextContent("/project");
  expect(screen.getByTestId("project-wormhole")).toBeInTheDocument();
  expect(within(screen.getByTestId("project-wormhole")).getByTestId("particle-planet")).toHaveAttribute("data-particle-count", "260");
  act(() => jest.advanceTimersByTime(550));
  expect(screen.getByTestId("path")).toHaveTextContent("/project/bone-disease-prediction");
  expect(screen.getByRole("heading", { name: "Bone Disease Prediction", level: 1 })).toBeInTheDocument();
  act(() => jest.advanceTimersByTime(1));
  expect(screen.getByRole("heading", { name: "Bone Disease Prediction", level: 1 })).toHaveFocus();
  expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  act(() => jest.advanceTimersByTime(529));
  expect(screen.queryByTestId("project-wormhole")).not.toBeInTheDocument();
});

test("reduced motion navigates immediately without an overlay", () => {
  window.matchMedia.mockReturnValue({ matches: true });
  render(<Harness />);
  selectProject();
  expect(screen.getByTestId("path")).toHaveTextContent("/project/bone-disease-prediction");
  expect(screen.queryByTestId("project-wormhole")).not.toBeInTheDocument();
});

test("back during descent cancels delayed navigation and clears the overlay", () => {
  render(<Harness />);
  selectProject();
  act(() => window.dispatchEvent(new PopStateEvent("popstate")));
  act(() => jest.advanceTimersByTime(1200));
  expect(screen.getByTestId("path")).toHaveTextContent("/project");
  expect(screen.queryByTestId("project-wormhole")).not.toBeInTheDocument();
});

test("repeated activation starts only one descent", () => {
  render(<Harness />);
  fireEvent.click(screen.getByRole("button", { name: "Select Bone Disease Prediction" }));
  const link = screen.getByRole("link", { name: /Explore Project/i });
  fireEvent.click(link);
  fireEvent.click(link);
  act(() => jest.advanceTimersByTime(550));
  expect(screen.getByTestId("path")).toHaveTextContent("/project/bone-disease-prediction");
  act(() => jest.advanceTimersByTime(530));
  expect(screen.queryByTestId("project-wormhole")).not.toBeInTheDocument();
});
