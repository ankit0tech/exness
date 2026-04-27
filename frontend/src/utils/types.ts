export type OpenTrade = {
    id: number;
    user_id: number;
    account_id: number;
    instrument_id: number;

    side: "LONG" | "SHORT";
    status: "OPEN" | "CLOSED" | "LIQUIDATED";

    quantity: string;      // bigint serialized to string
    leverage: number;
    entry_price: string;   // bigint -> string
    entry_time: Date;    // ISO date string
    notional: string;      // bigint -> string
    margin_used: string;   // bigint -> string
    fees: string;          // bigint -> string

    exit_price: string | null;
    exit_time: Date | null;
    realized_pnl: string;  // bigint -> string

    created_at: Date;
    updated_at: Date;

    instrument: {
        base_asset: string;
        symbol: string;
    };
};
