import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders home marketing content", () => {
  render(<App />);
  expect(screen.getByText(/Verify Certificates/i)).toBeInTheDocument();
});
