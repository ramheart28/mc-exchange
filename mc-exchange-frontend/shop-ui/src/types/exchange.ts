
export interface ExchangeItem {
    ts: string; //timestamp (ISO String)
    player: string;
    dimension: string;
    x: number;
    y: number;
    z: number;
    loc_src:string; //optional tag like Region or Shop
    input_item_id: string; //minecraft item id
    input_qty: number;
    output_item_id: string; //minecraft item id
    output_qty: number;
    exchange_possible: number; //how many exchanges were possible based on output qty and stock
    raw:string;
    hash_id:string; //unique deduplication key
    compacted_input:boolean; 
    compacted_output:boolean;
}