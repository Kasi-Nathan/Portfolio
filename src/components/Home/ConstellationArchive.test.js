import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ConstellationArchive, { archiveProjects } from "./ConstellationArchive";
import projectData from "../../data/projects.json";

let originalObserver;

beforeEach(() => {
  originalObserver = global.IntersectionObserver;
});

afterEach(() => {
  global.IntersectionObserver = originalObserver;
});

test("three showcases use existing screenshots, copy, tags, links, and the full collection route", () => {
  global.IntersectionObserver = undefined;
  render(<MemoryRouter><ConstellationArchive /></MemoryRouter>);
  expect(screen.getByRole("heading", { name: "Ideas in orbit." })).toBeInTheDocument();
  expect(screen.getByText("03 / THE CONSTELLATION ARCHIVE")).toBeInTheDocument();
  expect(archiveProjects).toHaveLength(3);
  expect(screen.getAllByRole("article")).toHaveLength(3);
  archiveProjects.forEach(project => {
    expect(projectData.projects).toContain(project);
    expect(screen.getByRole("heading", { name: project.title })).toBeInTheDocument();
    expect(screen.getByText(project.summary)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: `${project.title} project screenshot` })).toHaveAttribute("src", project.image);
    project.techStack.split(",").forEach(tag => expect(screen.getAllByText(tag.trim()).length).toBeGreaterThan(0));
  });
  expect(screen.getByRole("link", { name: /Explore all projects/ })).toHaveAttribute("href", "/project");
  expect(screen.queryByRole("link", { name: /Explore Project$/i })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Live demo/ })).toHaveAttribute("href", archiveProjects[2].demoLink);
});

test("failed screenshots have a named fallback", () => {
  global.IntersectionObserver = undefined;
  render(<MemoryRouter><ConstellationArchive /></MemoryRouter>);
  fireEvent.error(screen.getByRole("img", { name: `${archiveProjects[0].title} project screenshot` }));
  expect(screen.getByRole("img", { name: `${archiveProjects[0].title} screenshot unavailable` })).toBeInTheDocument();
});

test("scroll reveals remain visible and release their observer", () => {
  const observe = jest.fn();
  const unobserve = jest.fn();
  const disconnect = jest.fn();
  let notify;
  global.IntersectionObserver = jest.fn(callback => {
    notify = callback;
    return { observe, unobserve, disconnect };
  });
  const view = render(<MemoryRouter><ConstellationArchive /></MemoryRouter>);
  const first = observe.mock.calls[0][0];
  notify([{ target: first, isIntersecting: true }]);
  expect(first).toHaveClass("is-visible");
  expect(unobserve).toHaveBeenCalledWith(first);
  notify([{ target: first, isIntersecting: false }]);
  expect(first).toHaveClass("is-visible");
  view.unmount();
  expect(disconnect).toHaveBeenCalledTimes(1);
});
