import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import projectData from "../../data/projects.json";
import ConstellationArchive from "../Home/ConstellationArchive";
import Projects from "./Projects";
import { GalaxyTransitionProvider } from "./GalaxyTransition";

beforeEach(() => {
  jest.useFakeTimers();
  window.scrollTo = jest.fn();
  window.requestAnimationFrame = callback => setTimeout(callback, 0);
  window.cancelAnimationFrame = clearTimeout;
  window.matchMedia = jest.fn().mockReturnValue({ matches: false });
});
afterEach(() => jest.useRealTimers());

test("every CMS project is selectable and its real content and links appear", () => {
  render(<MemoryRouter><Projects /></MemoryRouter>);
  const worlds = screen.getAllByRole("button", { name: /^Select / });
  expect(worlds).toHaveLength(projectData.projects.length);
  expect(screen.getAllByTestId("particle-planet")).toHaveLength(projectData.projects.length);
  const project = projectData.projects.find(item => item.id === "window-swap-clone");
  fireEvent.click(screen.getByRole("button", { name: `Select ${project.title}` }));
  expect(screen.getByRole("heading", { name: project.title, level: 2 })).toBeInTheDocument();
  expect(screen.getByText(project.summary)).toBeInTheDocument();
  expect(screen.getByRole("img", { name: `${project.title} project screenshot` })).toHaveAttribute("src", project.image);
  expect(screen.getByRole("link", { name: /Explore Project/i })).toHaveAttribute("href", `/project/${project.id}`);
  expect(screen.getByRole("link", { name: /Live demo/i })).toHaveAttribute("href", project.demoLink);
});

test("planet particle budget adapts when the viewport crosses mobile width", () => {
  const initialWidth = window.innerWidth;
  window.innerWidth = 600;
  try {
    const view = render(<MemoryRouter><Projects /></MemoryRouter>);
    expect(screen.getAllByTestId("particle-planet")[0]).toHaveAttribute("data-particle-count", "90");
    window.innerWidth = 1200;
    fireEvent.resize(window);
    expect(screen.getAllByTestId("particle-planet")[0]).toHaveAttribute("data-particle-count", "260");
    view.unmount();
  } finally {
    window.innerWidth = initialWidth;
  }
});

test("Explore all projects reveals the galaxy after a brief route transition", () => {
  render(<MemoryRouter initialEntries={["/"]}><GalaxyTransitionProvider><Routes><Route path="/" element={<ConstellationArchive />} /><Route path="/project" element={<Projects />} /></Routes></GalaxyTransitionProvider></MemoryRouter>);
  fireEvent.click(screen.getByRole("link", { name: /Explore all projects/i }));
  expect(screen.getByTestId("galaxy-travel")).toBeInTheDocument();
  act(() => jest.advanceTimersByTime(580));
  expect(screen.getByRole("heading", { name: /Explore the universe/i })).toBeInTheDocument();
  act(() => jest.advanceTimersByTime(500));
  expect(screen.queryByTestId("galaxy-travel")).not.toBeInTheDocument();
});

test("reduced motion opens the galaxy without an overlay", () => {
  window.matchMedia.mockReturnValue({ matches: true });
  render(<MemoryRouter initialEntries={["/"]}><GalaxyTransitionProvider><Routes><Route path="/" element={<ConstellationArchive />} /><Route path="/project" element={<Projects />} /></Routes></GalaxyTransitionProvider></MemoryRouter>);
  fireEvent.click(screen.getByRole("link", { name: /Explore all projects/i }));
  expect(screen.getByRole("heading", { name: /Explore the universe/i })).toBeInTheDocument();
  expect(screen.queryByTestId("galaxy-travel")).not.toBeInTheDocument();
});

test("back navigation during travel cancels delayed galaxy navigation", () => {
  render(<MemoryRouter initialEntries={["/"]}><GalaxyTransitionProvider><Routes><Route path="/" element={<ConstellationArchive />} /><Route path="/project" element={<Projects />} /></Routes></GalaxyTransitionProvider></MemoryRouter>);
  fireEvent.click(screen.getByRole("link", { name: /Explore all projects/i }));
  act(() => window.dispatchEvent(new PopStateEvent("popstate")));
  act(() => jest.advanceTimersByTime(1200));
  expect(screen.queryByTestId("galaxy-travel")).not.toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: /Explore the universe/i })).not.toBeInTheDocument();
});
