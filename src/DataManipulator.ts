import { ServerRespond } from './DataStreamer';

export interface Row {
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
}


export class DataManipulator {
  static generateRow(serverRespond: ServerRespond[]): Row {
    const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2; // Here we compute for properly depiction a price of the stock (ABC)
    const priceDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) / 2; // Here we compute for properly depiction a price of the stock (DEF)
    const ratio = priceABC / priceDEF; // Here we calculate the ratio using both prices of stocks
    const upperBound = 1 + 0.05;
    const lowerBound = 1 - 0.05;
    return {
      price_abc: priceABC,
      price_def: priceDEF,
      ratio,
      timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ?
          serverRespond[0].timestamp : serverRespond[1].timestamp,
      upper_bound: upperBound,
      lower_bound: lowerBound,
      // trigger_alert  has a value if the threshold is passed by the ratio.
      // Otherwise if the ratio remains within the threshold we do not need a value
      trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
    };
  }
}
