export type TOptions = {
    x: number;
    y: number;
    fontSize?: number;
    anchor?: 'left'|'center'|'right'|'baseline'|'top'|'bottom'|'middle';
    letterSpacing?: string;
    attributes?: {
        fill: string;
    }
}
export interface InfoInterface {
    // template: string;
    name: string;
    date: string;
    // info: Object;
    // options: TOptions;
}
