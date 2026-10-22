/* These tests inspect measured layout nodes and flush the lazy scene import. */
/* eslint-disable testing-library/no-container, testing-library/no-node-access, testing-library/no-unnecessary-act */
import React from "react";
import { act, render, screen } from "@testing-library/react";
import SupernovaHome, { homepageProgress, homepageReveal, journeyPosition, planetFormation, finaleAmount, finaleProgress, finaleFraming } from "./SupernovaHome";
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
  expect(homepageProgress(-200, 1000)).toBeCloseTo(0.72 * 0.2 / 0.88);
  expect(homepageProgress(-300, 1000)).toBeCloseTo(homepageProgress(-150, 500));
  expect(homepageProgress(-400, 1000)).toBeCloseTo(0.72 * 0.4 / 0.88);
  expect(homepageProgress(-750, 1000)).toBeCloseTo(0.72 * 0.75 / 0.88);
  expect(homepageProgress(-880, 1000)).toBe(0.72);
  expect(homepageProgress(-850, 1000)).toBeLessThan(0.72);
  expect(homepageProgress(-20000, 1000)).toBe(0.72);
  expect(homepageProgress(0, 1000)).toBe(0);
  expect(homepageReveal(0)).toBe(0);
  expect(journeyPosition(-500, 1000)).toBe(0.5);
  expect(homepageReveal(0.3)).toBe(0);
  expect(homepageReveal(0.65)).toBe(0);
  expect(homepageReveal(0.8)).toBe(1);
  expect(homepageReveal(0.86)).toBeGreaterThan(0);
  expect(homepageReveal(0.9)).toBe(1);
  expect(homepageReveal(0.975)).toBeLessThan(1);
  expect(homepageReveal(1)).toBe(0);
  expect(planetFormation(0.2)).toBe(0);
  expect(planetFormation(0.5)).toBe(0);
  expect(planetFormation(0.7)).toBeGreaterThan(homepageReveal(0.7));
  expect(planetFormation(0.8)).toBeGreaterThan(0);
  expect(planetFormation(0.9)).toBe(1);
  expect(planetFormation(0.975)).toBeLessThan(1);
  expect(planetFormation(1)).toBe(0);
});

test("mounts one scene, propagates motion preference and disposes on unmount", async () => {
  const scene = { setProgress: jest.fn(), setReducedMotion: jest.fn(), dispose: jest.fn() };
  const preference = { matches: true, addEventListener: jest.fn(), removeEventListener: jest.fn() };
  const originalMatchMedia = window.matchMedia;
  window.matchMedia = () => preference;
  createScene.mockReturnValue(scene);
  const view = render(<SupernovaHome><section className="home-intro"><h1 id="home-title">Portfolio heading</h1></section></SupernovaHome>);
  await act(async () => {});
  expect(createScene).toHaveBeenCalledTimes(1);
  expect(scene.setReducedMotion).toHaveBeenCalledWith(true);
  expect(scene.setProgress).toHaveBeenCalledWith(0.72);
  expect(view.container.querySelector('.home-supernova-journey').style.getPropertyValue('--hero-reveal')).toBe('1');
  expect(view.container.querySelector('.home-supernova-journey').style.getPropertyValue('--designation-opacity')).toBe('1');
  expect(view.container.querySelector('.home-intro').hasAttribute('inert')).toBe(false);
  expect(view.container.querySelector('.home-intro').getAttribute('aria-hidden')).toBe('false');
  expect(screen.getByRole("heading", { name: "Every idea begins with a spark.", hidden: true })).toBeInTheDocument();
  expect(screen.getByText(/Scroll to ignite the universe/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Skip introduction" })).toHaveAttribute("href", "#home");
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
  const scene = { setProgress: jest.fn(), setPlanetAmount: jest.fn(), setReducedMotion: jest.fn(), dispose: jest.fn() };
  createScene.mockReturnValue(scene);
  const originalScroll = window.scrollY;
  window.scrollY = 0;
  const view = render(<SupernovaHome><section className="home-intro"><h1 id="home-title" tabIndex={-1}>Portfolio heading</h1><button>Portfolio action</button></section></SupernovaHome>);
  await act(async () => {});
  const journey = view.container.querySelector('.home-supernova-journey');
  const hero = view.container.querySelector('.home-intro');
  const stage = view.container.querySelector('.home-supernova-stage');
  let top = -3864;
  window.scrollY = 3864;
  journey.getBoundingClientRect = () => ({ top, height: 5600 });
  stage.getBoundingClientRect = () => ({ height: 1000 });
  expect(journey.dataset.heroVisible).toBe('false');
  expect(journey.dataset.heroInteractive).toBe('false');
  expect(hero.hasAttribute('inert')).toBe(true);
  expect(hero.getAttribute('aria-hidden')).toBe('true');
  window.dispatchEvent(new Event('resize'));
  function scroll() {
    act(() => {
      window.dispatchEvent(new Event('scroll'));
      jest.advanceTimersByTime(20);
    });
  }
  scroll();
  expect(scene.setProgress.mock.lastCall[0]).toBeCloseTo(0.72 * 0.84 / 0.88);
  expect(journey.style.getPropertyValue('--designation-opacity')).toBe('0');
  expect(journey.dataset.openingVisible).toBe('false');
  expect(Number(journey.style.getPropertyValue('--hero-reveal'))).toBeGreaterThan(0.1);
  expect(journey.dataset.heroVisible).toBe('true');
  expect(hero.hasAttribute('inert')).toBe(false);
  expect(hero.getAttribute('aria-hidden')).toBe('false');
  top = -4140;
  window.scrollY = 4140;
  scroll();
  expect(scene.setProgress.mock.lastCall[0]).toBe(0.72);
  expect(scene.setPlanetAmount).toHaveBeenLastCalledWith(1);
  expect(journey.style.getPropertyValue('--hero-reveal')).toBe('1');
  expect(journey.dataset.heroInteractive).toBe('true');
  expect(hero.hasAttribute('inert')).toBe(false);
  top = -4278;
  window.scrollY = 4278;
  scroll();
  expect(journey.style.getPropertyValue('--hero-reveal')).toBe('1');
  top = -4485;
  window.scrollY = 4485;
  scroll();
  expect(Number(journey.style.getPropertyValue('--hero-reveal'))).toBeLessThan(1);
  expect(Number(journey.style.getPropertyValue('--hero-reveal'))).toBeGreaterThan(0);
  expect(scene.setPlanetAmount.mock.lastCall[0]).toBeLessThan(1);
  top = -3864;
  window.scrollY = 3864;
  scroll();
  expect(journey.dataset.heroInteractive).toBe('true');
  expect(hero.hasAttribute('inert')).toBe(false);
  top = 0;
  window.scrollY = 0;
  scroll();
  expect(scene.setProgress).toHaveBeenLastCalledWith(0);
  expect(scene.setPlanetAmount).toHaveBeenLastCalledWith(0);
  expect(Number(journey.style.getPropertyValue('--hero-reveal'))).toBe(0);
  expect(journey.dataset.heroVisible).toBe('false');
  expect(journey.dataset.heroInteractive).toBe('false');
  expect(hero.hasAttribute('inert')).toBe(true);
  expect(journey.style.getPropertyValue('--designation-opacity')).toBe('1');
  expect(journey.dataset.openingVisible).toBe('true');
  top = -150;
  window.scrollY = 150;
  scroll();
  expect(journey.style.getPropertyValue('--designation-opacity')).toBe('1');
  top = 0;
  window.scrollY = 0;
  scroll();
  act(() => screen.getByRole('link', { name: "Skip introduction" }).click());
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
  const view = render(<SupernovaHome><section className="home-intro"><h1 id="home-title">Portfolio heading</h1></section></SupernovaHome>);
  await act(async () => {});
  expect(view.container.querySelector('.home-supernova-journey').dataset.fallback).toBe('true');
  expect(view.container.querySelector('.home-supernova-journey').style.getPropertyValue('--hero-reveal')).toBe('1');
  expect(view.container.querySelector('.home-supernova-journey').dataset.heroInteractive).toBe('true');
  expect(view.container.querySelector('.home-intro').hasAttribute('inert')).toBe(false);
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
