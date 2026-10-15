import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import App from './App';
import projects from './data/projects.json';
import routing from '../vercel.json';

jest.mock('aos', () => ({ init: jest.fn(), refreshHard: jest.fn() }));

test('Vercel rewrites only production client routes, leaving APIs and assets alone', () => {
  expect(routing.rewrites.map(({ source }) => source).sort()).toEqual([
    '/about', '/bonegallery', '/cryptogallery', '/gallery', '/project',
  ]);
  expect(routing.rewrites.every(({ destination }) => destination === '/index.html')).toBe(true);
});
// Route tests exercise HTML/navigation; GPU behavior requires manual WebGL review.
jest.mock('./components/Supernova/SupernovaScene', () => ({
  __esModule: true,
  default: () => ({ setProgress: jest.fn(), setReducedMotion: jest.fn(), dispose: jest.fn() }),
}));

beforeEach(() => {
  jest.useFakeTimers();
  window.scrollTo = jest.fn();
});
afterEach(() => { cleanup(); jest.useRealTimers(); });

test.each([
  ['/', /I build thoughtful digital products/i],
  ['/project', /Work with a clear purpose/i],
  ['/about', /Curious by nature/i],
  ['/gallery', /Project Screenshots/i],
  ['/bonegallery', /Project Screenshots/i],
  ['/cryptogallery', /Project Screenshots/i],
])('direct route %s renders its content and one shared background', (route, heading) => {
  window.history.replaceState({}, '', route);
  const { container } = render(<App />);
  expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  expect(container.querySelectorAll('.space-background')).toHaveLength(1);
  expect(container.querySelector('.space-background')).toHaveAttribute('aria-hidden', 'true');
  expect(container.querySelector('.cursor-inner')).toBeNull();
  expect(container.querySelectorAll('.home-supernova-layer canvas')).toHaveLength(route === '/' ? 1 : 0);
  expect(container.querySelector('.space-background').classList.contains('space-background--supernova')).toBe(route === '/');
  expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
});

test('navigation retains projects from the CMS data and native case-study disclosures', () => {
  window.history.replaceState({}, '', '/');
  const { container } = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /Explore my work/i }));
  expect(window.location.pathname).toBe('/project');
  expect(container.querySelector('.home-supernova-layer')).toBeNull();
  expect(container.querySelector('.space-background--supernova')).toBeNull();
  expect(container.querySelectorAll('.project-card-view')).toHaveLength(projects.projects.length);
  expect(container.querySelectorAll('details > summary')).toHaveLength(projects.projects.length);
  expect(screen.getAllByText('Read case study').length).toBeGreaterThan(0);
});

test('unknown routes retain the Home fallback', () => {
  window.history.replaceState({}, '', '/missing');
  render(<App />);
  expect(screen.getByRole('heading', { name: /I build thoughtful digital products/i })).toBeInTheDocument();
});
