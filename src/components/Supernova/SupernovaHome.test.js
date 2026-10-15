import React from "react";
import { act, render, screen } from "@testing-library/react";
import SupernovaHome, { homepageProgress, homepageReveal, finaleAmount, finaleProgress, finaleFraming } from "./SupernovaHome";
import createScene from "./SupernovaScene";

jest.mock("./SupernovaScene", () => ({ __esModule: true, default: jest.fn() }));

test("nebula destination framing depends only on viewport width, never scroll", () => {
  expect(finaleFraming(1440)).toEqual([0.12, 0.02]);
  expect(finaleFraming(992)).toEqual([0.12, 0.02]);
  expect(finaleFraming(991)).toEqual([0, -0.22]);
  expect(finaleFraming(390)).toEqual([0, -0.22]);
});

test("homepage mapping reverses, tracks opening height, and stops before nebula", () => {
  expect(homepageProgress(10, 1000)).toBe(0);
  expect(homepageProgress(-500, 1000)).toBeCloseTo(0.36);
  expect(homepageProgress(-250, 500)).toBeCloseTo(0.36);
  expect(homepageProgress(-20000, 1000)).toBe(0.72);
  expect(homepageProgress(0, 1000)).toBe(0);
  expect(homepageReveal(0.42)).toBe(0);
  expect(homepageReveal(0.57)).toBeCloseTo(0.5);
  expect(homepageReveal(0.72)).toBe(1);
});

test("mounts one scene, propagates motion preference and disposes on unmount", async () => {
  const scene = { setProgress: jest.fn(), setReducedMotion: jest.fn(), dispose: jest.fn() };
  const preference = { matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() };
  const originalMatchMedia = window.matchMedia;
  window.matchMedia = () => preference;
  createScene.mockReturnValue(scene);
  const view = render(<SupernovaHome />);
  await act(async () => {});
  expect(createScene).toHaveBeenCalledTimes(1);
  expect(scene.setReducedMotion).toHaveBeenCalledWith(true);
  expect(scene.setProgress).toHaveBeenCalledWith(0.72);
  expect(view.container.querySelector('.home-supernova-journey').style.getPropertyValue('--hero-reveal')).toBe('1');
  expect(screen.getByRole("link", { name: /Explore the portfolio/ })).toHaveAttribute("href", "#home");
  act(() => {
    preference.matches = false;
    preference.addEventListener.mock.calls[0][1]();
  });
  expect(scene.setReducedMotion).toHaveBeenLastCalledWith(false);
  view.unmount();
  expect(scene.dispose).toHaveBeenCalledTimes(1);
  expect(preference.removeEventListener).toHaveBeenCalledWith("change", preference.addEventListener.mock.calls[0][1]);
  window.matchMedia = originalMatchMedia;
});

test("measured sticky travel reverses the reveal and keyboard focus bypasses it", async () => {
  jest.useFakeTimers();
  const scene = { setProgress: jest.fn(), setReducedMotion: jest.fn(), dispose: jest.fn() };
  createScene.mockReturnValue(scene);
  const view = render(<SupernovaHome><section className="home-hero"><button>Portfolio action</button></section></SupernovaHome>);
  await act(async () => {});
  const journey = view.container.querySelector('.home-supernova-journey');
  const stage = view.container.querySelector('.home-supernova-stage');
  let top = -640;
  const originalScroll = window.scrollY;
  window.scrollY = 640;
  journey.getBoundingClientRect = () => ({ top, height: 1800 });
  stage.getBoundingClientRect = () => ({ height: 1000 });
  window.dispatchEvent(new Event('resize'));
  function scroll() {
    act(() => {
      window.dispatchEvent(new Event('scroll'));
      jest.advanceTimersByTime(20);
    });
  }
  scroll();
  expect(scene.setProgress).toHaveBeenLastCalledWith(0.576);
  expect(Number(journey.style.getPropertyValue('--hero-reveal'))).toBeGreaterThan(0.5);
  top = 0;
  window.scrollY = 0;
  scroll();
  expect(scene.setProgress).toHaveBeenLastCalledWith(0);
  expect(journey.style.getPropertyValue('--hero-reveal')).toBe('0');
  act(() => screen.getByRole('button', { name: 'Portfolio action' }).focus());
  expect(scene.setProgress).toHaveBeenLastCalledWith(0.72);
  expect(journey.dataset.heroInteractive).toBe('true');
  view.unmount();
  window.scrollY = originalScroll;
  jest.useRealTimers();
});

test("contact mapping holds dust, converges at the homepage bottom, and reverses", () => {
  const amount = (scroll) => finaleAmount(scroll, 800, 4000, 4800, 800, 4100);
  expect(amount(2000)).toBe(0);
  expect(finaleProgress(0.72, amount(2000), false)).toBe(0.72);
  expect(amount(3660)).toBeCloseTo(0.5);
  expect(finaleProgress(0.72, amount(3660), false)).toBeCloseTo(0.86);
  expect(finaleProgress(0.72, amount(4000), false)).toBe(1);
  expect(amount(3660)).toBeCloseTo(0.5);
  expect(amount(3320)).toBe(0);
  expect(finaleProgress(0.36, amount(400), false)).toBe(0.36);
  expect(finaleProgress(0, 0, true)).toBe(0.72);
  expect(finaleProgress(0.72, 0.01, true)).toBe(1);
});

test("finale waits for the measured contact reveal region, including after layout shifts", () => {
  expect(finaleAmount(3240, 800, 4000, 4800, 800, 4100)).toBe(0);
  expect(finaleAmount(3319, 800, 4000, 4800, 800, 4100)).toBe(0);
  expect(finaleAmount(3500, 800, 4000, 4800, 800, 4100)).toBeGreaterThan(0);
  // Content above contact grows: the same scroll offset must become dust again.
  expect(finaleAmount(3500, 800, 4400, 5200, 800, 4500)).toBe(0);
  expect(finaleAmount(4400, 800, 4400, 5200, 800, 4500)).toBe(1);
  // Narrow viewport: complete at the measured home bottom, without a spacer.
  expect(finaleAmount(4470, 800, 4000, 5200, 730, 4600)).toBe(1);
});

test("short pages and viewport changes retain finite bounded finale mapping", () => {
  expect(finaleAmount(0, 800, 500, 700, 800, 0)).toBe(0);
  expect(finaleAmount(4100, 800, 4000, 4800, 600, 4200)).toBeGreaterThan(0);
  expect(finaleAmount(4200, 800, 4000, 4800, 600, 4200)).toBe(1);
});

test("unavailable WebGL exposes the hero and removes the cinematic interval", async () => {
  createScene.mockImplementationOnce((canvas, onStatus) => {
    onStatus('unavailable');
    return null;
  });
  const view = render(<SupernovaHome />);
  await act(async () => {});
  expect(view.container.querySelector('.home-supernova-journey').dataset.fallback).toBe('true');
  expect(view.container.querySelector('.home-supernova-journey').style.getPropertyValue('--hero-reveal')).toBe('1');
  view.unmount();
});

test("temporary context loss keeps the journey while permanent failure collapses it", async () => {
  let reportStatus;
  const scene = { setProgress: jest.fn(), setReducedMotion: jest.fn(), dispose: jest.fn() };
  createScene.mockImplementationOnce((canvas, onStatus) => {
    reportStatus = onStatus;
    onStatus("ready");
    return scene;
  });
  const view = render(<SupernovaHome />);
  await act(async () => {});
  const journey = view.container.querySelector(".home-supernova-journey");
  expect(journey.dataset.fallback).toBe("false");
  act(() => reportStatus("lost"));
  expect(journey.dataset.fallback).toBe("false");
  expect(view.container.querySelector(".home-supernova-layer--lost")).toBeInTheDocument();
  act(() => reportStatus("ready"));
  expect(journey.dataset.fallback).toBe("false");
  act(() => reportStatus("unavailable"));
  expect(journey.dataset.fallback).toBe("true");
  view.unmount();
  expect(scene.dispose).toHaveBeenCalledTimes(1);
});

test("navigation before module loading completes cannot create a renderer", async () => {
  createScene.mockClear();
  const view = render(<SupernovaHome />);
  view.unmount();
  await act(async () => {});
  expect(createScene).not.toHaveBeenCalled();
});
