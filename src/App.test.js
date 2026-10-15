/* Route tests inspect the shared canvas shell and use a table of route cases. */
/* eslint-disable testing-library/no-container, testing-library/no-node-access, jest/no-conditional-expect */
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import App from './App';
import projects from './data/projects.json';
import routing from '../vercel.json';

jest.mock('aos', () => ({ init: jest.fn(), refreshHard: jest.fn() }));

test('Vercel rewrites only production client routes, leaving APIs and assets alone', () => {
  expect(routing.rewrites.map(({ source }) => source).sort()).toEqual([
    '/about', '/bonegallery', '/cryptogallery', '/gallery', '/project', '/project/:projectId',
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
  ['/project', /Explore the universe/i],
  ['/project/bone-disease-prediction', /Bone Disease Prediction/i],
  ['/about', /Curious by nature/i],
  ['/gallery', /Project Screenshots/i],
  ['/bonegallery', /Project Screenshots/i],
  ['/cryptogallery', /Project Screenshots/i],
])('direct route %s renders its content and one shared background', (route, heading) => {
  window.history.replaceState({}, '', route);
  const { container } = render(<App />);
  if (route === '/') {
    const designation = container.querySelector('.home-stellar-name');
    expect(designation).toBeInTheDocument();
    expect(designation.textContent).toBe('CYGNUS-01');
    expect(screen.getByRole('heading', { name: 'Every idea begins with a spark.' })).toBeInTheDocument();
    expect(screen.getByText('KASI NATHAN / DIGITAL UNIVERSE')).toBeInTheDocument();
    expect(container.querySelector('.home-intro')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.home-intro')).toHaveAttribute('inert');
  } else {
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  }
  expect(container.querySelectorAll('.space-background')).toHaveLength(1);
  expect(container.querySelector('.space-background')).toHaveAttribute('aria-hidden', 'true');
  expect(container.querySelector('.cursor-inner')).toBeNull();
  expect(container.querySelectorAll('.home-supernova-layer canvas')).toHaveLength(route === '/' ? 1 : 0);
  expect(container.querySelector('.space-background').classList.contains('space-background--supernova')).toBe(route === '/');
  expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
});

test('navigation retains every CMS project in the galaxy', () => {
  window.history.replaceState({}, '', '/');
  const { container } = render(<App />);
  fireEvent.click(screen.getByRole('link', { name: /^Projects$/i }));
  expect(window.location.pathname).toBe('/project');
  expect(container.querySelector('.home-supernova-layer')).toBeNull();
  expect(container.querySelector('.space-background--supernova')).toBeNull();
  expect(container.querySelectorAll('.galaxy-world')).toHaveLength(projects.projects.length);
  expect(screen.getByRole('heading', { name: /Explore the universe/i })).toBeInTheDocument();
});

test('unknown routes retain the Home fallback', () => {
  window.history.replaceState({}, '', '/missing');
  const { container } = render(<App />);
  const designation = container.querySelector('.home-stellar-name');
  expect(designation).toBeInTheDocument();
  expect(designation.textContent).toBe('CYGNUS-01');
  expect(container.querySelector('.home-intro')).toHaveAttribute('aria-hidden', 'true');
});

test('the introduction, Beyond the Stars, and archive appear once in sequence', () => {
  window.history.replaceState({}, '', '/');
  const { container } = render(<App />);
  const intro = container.querySelector('.home-intro');
  const projectsSection = container.querySelector('.constellation-archive');
  const about = container.querySelector('.beyond-stars');
  expect(intro).toHaveTextContent('KASINATHAN.');
  expect(intro).toHaveTextContent(/Developer.*Creative Technologist/);
  expect(about.querySelector('img')).toHaveAttribute('alt', 'Kasi Nathan Murugan');
  expect(container.querySelectorAll('.beyond-stars')).toHaveLength(1);
  expect(container.querySelector('.home-profile')).toBeNull();
  expect(container.querySelector('.home-quick-about')).toBeNull();
  expect(intro.compareDocumentPosition(about) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(about.compareDocumentPosition(projectsSection) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
