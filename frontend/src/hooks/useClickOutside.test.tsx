import { describe, it, expect, jest } from '@jest/globals';
import { useRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useClickOutside } from './useClickOutside';

function Probe({ onOutside }: { onOutside: () => void }) {
    const ref = useRef<HTMLDivElement | null>(null);
    useClickOutside(ref, onOutside);
    
    return (
        <div>
            <div ref={ref} data-testid="inside">inside</div>
            <button>outside</button>
        </div>
    );
}


describe('useClickOutside', () => {
    it('does NOT call handler when clicking inside the ref', async () => {
        const onOutside = jest.fn();
        render(<Probe onOutside={onOutside} />);

        await userEvent.click(screen.getByTestId('inside'));
        expect(onOutside).not.toHaveBeenCalled();
    });

    it('calls handler when clicking outside the ref', async () => {
        const onOutside = jest.fn();
        render(<Probe onOutside={onOutside} />);

        await userEvent.click(screen.getByRole('button', { name: /outside/i }));
        expect(onOutside).toHaveBeenCalledTimes(1);
    });
});