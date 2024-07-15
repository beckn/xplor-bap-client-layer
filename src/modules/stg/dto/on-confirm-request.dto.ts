// To parse this data:
//
//   import { Convert, OnConfirmDto } from "./file";
//
//   const iOnConfirmDto = Convert.toIOnConfirmDto(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface OnConfirmDto {
  data?: Datum[];
}

export interface Datum {
  context?: Context;
  message?: Message;
}

export interface Context {
  domain?: string;
  action?: string;
  version?: string;
  bpp_id?: string;
  bpp_uri?: string;
  country?: string;
  city?: string;
  location?: Location;
  bap_id?: string;
  bap_uri?: string;
  transaction_id?: string;
  message_id?: string;
  ttl?: string;
  timestamp?: Date;
}

export interface Location {
  country?: City;
  city?: City;
}

export interface City {
  name?: string;
  code?: string;
}

export interface Message {
  orderId?: string;
  provider?: Provider;
  items?: Item[];
  fulfillments?: Fulfillment[];
  quote?: Quote;
}

export interface Fulfillment {
  agent?: Agent;
  customer?: Customer;
  stops?: Stop[];
  tracking?: boolean;
}

export interface Agent {
  person?: AgentPerson;
  contact?: AgentContact;
}

export interface AgentContact {
  email?: string;
}

export interface AgentPerson {
  name?: string;
}

export interface Customer {
  person?: CustomerPerson;
  contact?: CustomerContact;
}

export interface CustomerContact {
  phone?: string;
  email?: string;
}

export interface CustomerPerson {
  name?: string;
  email?: string;
}

export interface Stop {
  id?: string;
  instructions?: Instructions;
}

export interface Instructions {
  name?: string;
  long_desc?: string;
  media?: MediaElement[];
}

export interface MediaElement {
  url?: string;
}

export interface Item {
  id?: string;
  name?: string;
  short_desc?: string;
  long_desc?: string;
  images?: MediaElement[];
  price?: Price;
  rating?: string;
  rateable?: boolean;
  quantity?: Quantity;
  tags?: Tag[];
}

export interface Price {
  currency?: string;
  value?: string;
}

export interface Quantity {
  maximum?: Maximum;
}

export interface Maximum {
  count?: number;
}

export interface Tag {
  code?: string;
  name?: string;
  display?: boolean;
}

export interface Provider {
  id?: string;
  name?: string;
  short_desc?: string;
  long_desc?: string;
  images?: ProviderImage[];
}

export interface ProviderImage {
  url?: string;
  size_type?: string;
}

export interface Quote {
  price?: Price;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toIOnConfirmDto(json: string): OnConfirmDto {
    return cast(JSON.parse(json), r('OnConfirmDto'));
  }

  public static iOnConfirmDtoToJson(value: OnConfirmDto): string {
    return JSON.stringify(uncast(value, r('OnConfirmDto')), null, 2);
  }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
  const prettyTyp = prettyTypeName(typ);
  const parentText = parent ? ` on ${parent}` : '';
  const keyText = key ? ` for key "${key}"` : '';
  throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ: any): string {
  if (Array.isArray(typ)) {
    if (typ.length === 2 && typ[0] === undefined) {
      return `an optional ${prettyTypeName(typ[1])}`;
    } else {
      return `one of [${typ
        .map((a) => {
          return prettyTypeName(a);
        })
        .join(', ')}]`;
    }
  } else if (typeof typ === 'object' && typ.literal !== undefined) {
    return typ.literal;
  } else {
    return typeof typ;
  }
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }));
    typ.jsonToJS = map;
  }

  return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }));
    typ.jsToJSON = map;
  }

  return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val;
    return invalidValue(typ, val, key, parent);
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length;
    for (let i = 0; i < l; i++) {
      const typ = typs[i];
      try {
        return transform(val, typ, getProps);
      } catch (_) {}
    }

    return invalidValue(typs, val, key, parent);
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val;
    return invalidValue(
      cases.map((a) => {
        return l(a);
      }),
      val,
      key,
      parent,
    );
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue(l('array'), val, key, parent);
    return val.map((el) => transform(el, typ, getProps));
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null;
    }

    const d = new Date(val);
    if (isNaN(d.valueOf())) {
      return invalidValue(l('Date'), val, key, parent);
    }

    return d;
  }

  function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
    if (val === null || typeof val !== 'object' || Array.isArray(val)) {
      return invalidValue(l(ref || 'object'), val, key, parent);
    }

    const result: any = {};
    Object.getOwnPropertyNames(props).forEach((key) => {
      const prop = props[key];
      const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
      result[prop.key] = transform(v, prop.typ, getProps, key, ref);
    });
    Object.getOwnPropertyNames(val).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key, ref);
      }
    });
    return result;
  }

  if (typ === 'any') return val;
  if (typ === null) {
    if (val === null) return val;
    return invalidValue(typ, val, key, parent);
  }

  if (typ === false) return invalidValue(typ, val, key, parent);
  let ref: any = undefined;
  while (typeof typ === 'object' && typ.ref !== undefined) {
    ref = typ.ref;
    typ = typeMap[typ.ref];
  }

  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === 'object') {
    return typ.hasOwnProperty('unionMembers')
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty('arrayItems')
      ? transformArray(typ.arrayItems, val)
      : typ.hasOwnProperty('props')
      ? transformObject(getProps(typ), typ.additional, val)
      : invalidValue(typ, val, key, parent);
  }

  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== 'number') return transformDate(val);
  return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
  return { literal: typ };
}

function a(typ: any) {
  return { arrayItems: typ };
}

function u(...typs: any[]) {
  return { unionMembers: typs };
}

function o(props: any[], additional: any) {
  return { props, additional };
}

function m(additional: any) {
  return { props: [], additional };
}

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  OnConfirmDto: o([{ json: 'data', js: 'data', typ: u(undefined, a(r('Datum'))) }], false),
  Datum: o(
    [
      { json: 'context', js: 'context', typ: u(undefined, r('Context')) },
      { json: 'message', js: 'message', typ: u(undefined, r('Message')) },
    ],
    false,
  ),
  Context: o(
    [
      { json: 'domain', js: 'domain', typ: u(undefined, '') },
      { json: 'action', js: 'action', typ: u(undefined, '') },
      { json: 'version', js: 'version', typ: u(undefined, '') },
      { json: 'bpp_id', js: 'bpp_id', typ: u(undefined, '') },
      { json: 'bpp_uri', js: 'bpp_uri', typ: u(undefined, '') },
      { json: 'country', js: 'country', typ: u(undefined, '') },
      { json: 'city', js: 'city', typ: u(undefined, '') },
      { json: 'location', js: 'location', typ: u(undefined, r('Location')) },
      { json: 'bap_id', js: 'bap_id', typ: u(undefined, '') },
      { json: 'bap_uri', js: 'bap_uri', typ: u(undefined, '') },
      { json: 'transaction_id', js: 'transaction_id', typ: u(undefined, '') },
      { json: 'message_id', js: 'message_id', typ: u(undefined, '') },
      { json: 'ttl', js: 'ttl', typ: u(undefined, '') },
      { json: 'timestamp', js: 'timestamp', typ: u(undefined, Date) },
    ],
    false,
  ),
  Location: o(
    [
      { json: 'country', js: 'country', typ: u(undefined, r('City')) },
      { json: 'city', js: 'city', typ: u(undefined, r('City')) },
    ],
    false,
  ),
  City: o(
    [
      { json: 'name', js: 'name', typ: u(undefined, '') },
      { json: 'code', js: 'code', typ: u(undefined, '') },
    ],
    false,
  ),
  Message: o(
    [
      { json: 'orderId', js: 'orderId', typ: u(undefined, '') },
      { json: 'provider', js: 'provider', typ: u(undefined, r('Provider')) },
      { json: 'items', js: 'items', typ: u(undefined, a(r('Item'))) },
      { json: 'fulfillments', js: 'fulfillments', typ: u(undefined, a(r('Fulfillment'))) },
      { json: 'quote', js: 'quote', typ: u(undefined, r('Quote')) },
    ],
    false,
  ),
  Fulfillment: o(
    [
      { json: 'agent', js: 'agent', typ: u(undefined, r('Agent')) },
      { json: 'customer', js: 'customer', typ: u(undefined, r('Customer')) },
      { json: 'stops', js: 'stops', typ: u(undefined, a(r('Stop'))) },
      { json: 'tracking', js: 'tracking', typ: u(undefined, true) },
    ],
    false,
  ),
  Agent: o(
    [
      { json: 'person', js: 'person', typ: u(undefined, r('AgentPerson')) },
      { json: 'contact', js: 'contact', typ: u(undefined, r('AgentContact')) },
    ],
    false,
  ),
  AgentContact: o([{ json: 'email', js: 'email', typ: u(undefined, '') }], false),
  AgentPerson: o([{ json: 'name', js: 'name', typ: u(undefined, '') }], false),
  Customer: o(
    [
      { json: 'person', js: 'person', typ: u(undefined, r('CustomerPerson')) },
      { json: 'contact', js: 'contact', typ: u(undefined, r('CustomerContact')) },
    ],
    false,
  ),
  CustomerContact: o(
    [
      { json: 'phone', js: 'phone', typ: u(undefined, '') },
      { json: 'email', js: 'email', typ: u(undefined, '') },
    ],
    false,
  ),
  CustomerPerson: o(
    [
      { json: 'name', js: 'name', typ: u(undefined, '') },
      { json: 'email', js: 'email', typ: u(undefined, '') },
    ],
    false,
  ),
  Stop: o(
    [
      { json: 'id', js: 'id', typ: u(undefined, '') },
      { json: 'instructions', js: 'instructions', typ: u(undefined, r('Instructions')) },
    ],
    false,
  ),
  Instructions: o(
    [
      { json: 'name', js: 'name', typ: u(undefined, '') },
      { json: 'long_desc', js: 'long_desc', typ: u(undefined, '') },
      { json: 'media', js: 'media', typ: u(undefined, a(r('MediaElement'))) },
    ],
    false,
  ),
  MediaElement: o([{ json: 'url', js: 'url', typ: u(undefined, '') }], false),
  Item: o(
    [
      { json: 'id', js: 'id', typ: u(undefined, '') },
      { json: 'name', js: 'name', typ: u(undefined, '') },
      { json: 'short_desc', js: 'short_desc', typ: u(undefined, '') },
      { json: 'long_desc', js: 'long_desc', typ: u(undefined, '') },
      { json: 'images', js: 'images', typ: u(undefined, a(r('MediaElement'))) },
      { json: 'price', js: 'price', typ: u(undefined, r('Price')) },
      { json: 'rating', js: 'rating', typ: u(undefined, '') },
      { json: 'rateable', js: 'rateable', typ: u(undefined, true) },
      { json: 'quantity', js: 'quantity', typ: u(undefined, r('Quantity')) },
      { json: 'tags', js: 'tags', typ: u(undefined, a(r('Tag'))) },
    ],
    false,
  ),
  Price: o(
    [
      { json: 'currency', js: 'currency', typ: u(undefined, '') },
      { json: 'value', js: 'value', typ: u(undefined, '') },
    ],
    false,
  ),
  Quantity: o([{ json: 'maximum', js: 'maximum', typ: u(undefined, r('Maximum')) }], false),
  Maximum: o([{ json: 'count', js: 'count', typ: u(undefined, 0) }], false),
  Tag: o(
    [
      { json: 'code', js: 'code', typ: u(undefined, '') },
      { json: 'name', js: 'name', typ: u(undefined, '') },
      { json: 'display', js: 'display', typ: u(undefined, true) },
    ],
    false,
  ),
  Provider: o(
    [
      { json: 'id', js: 'id', typ: u(undefined, '') },
      { json: 'name', js: 'name', typ: u(undefined, '') },
      { json: 'short_desc', js: 'short_desc', typ: u(undefined, '') },
      { json: 'long_desc', js: 'long_desc', typ: u(undefined, '') },
      { json: 'images', js: 'images', typ: u(undefined, a(r('ProviderImage'))) },
    ],
    false,
  ),
  ProviderImage: o(
    [
      { json: 'url', js: 'url', typ: u(undefined, '') },
      { json: 'size_type', js: 'size_type', typ: u(undefined, '') },
    ],
    false,
  ),
  Quote: o([{ json: 'price', js: 'price', typ: u(undefined, r('Price')) }], false),
};
