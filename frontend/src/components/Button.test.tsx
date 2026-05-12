import { describe, it, expect, jest } from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';


describe('Button', () => {
    it('renders its children as the label', () => {
        render(<Button onClick={() => {}}> Login with google</Button>);
        expect(
            screen.getByRole('button', { name: /login with google/i })
        ).toBeInTheDocument();
    });

    it('calls onClick when clicked', async () => {
        const onClick = jest.fn();
        render(<Button onClick={onClick}>Click Me</Button>);

        await userEvent.click(screen.getByRole('button', { name: /click me/i }));

        expect(onClick).toHaveBeenCalledTimes(1);
    });
});