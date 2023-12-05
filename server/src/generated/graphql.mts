import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
};

export type Artist = {
  __typename?: 'Artist';
  link?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type AutoInventoryRule = {
  __typename?: 'AutoInventoryRule';
  filter?: Maybe<AutoInventoryRuleFilter>;
  name?: Maybe<Scalars['String']['output']>;
  tradeQuantity?: Maybe<Array<Maybe<AutoInventoryRuleQuantityCaseValuePair>>>;
  wishQuantity?: Maybe<Array<Maybe<AutoInventoryRuleQuantityCaseValuePair>>>;
};

export type AutoInventoryRuleFilter = {
  __typename?: 'AutoInventoryRuleFilter';
  holo?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  rarity?: Maybe<Rarity>;
  type?: Maybe<Scalars['String']['output']>;
};

/**
 * - case must be like "qty>X", "qty<X", "qty=X", "qty>=X", "qty<=X", "qty!=X", or "default" where X is an integer
 * - value must be like "qty+X", "qty-X", "X+qty", or "X-qty" where X is and integer
 */
export type AutoInventoryRuleQuantityCaseValuePair = {
  __typename?: 'AutoInventoryRuleQuantityCaseValuePair';
  case?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

export type Card = {
  __typename?: 'Card';
  artists?: Maybe<Array<Maybe<Artist>>>;
  cost?: Maybe<Scalars['Int']['output']>;
  digital: Scalars['Boolean']['output'];
  effect?: Maybe<Scalars['String']['output']>;
  epic?: Maybe<Scalars['Boolean']['output']>;
  fun?: Maybe<Scalars['String']['output']>;
  goal?: Maybe<Scalars['Int']['output']>;
  holoType?: Maybe<HoloType>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  number?: Maybe<Scalars['Int']['output']>;
  power?: Maybe<Scalars['Int']['output']>;
  rarity?: Maybe<Rarity>;
  type: Scalars['String']['output'];
};

/** Filter for the cards returned. Any ommitted fields are not filtered on. */
export type CardFilter = {
  cost?: InputMaybe<IntFilter>;
  digital?: InputMaybe<Scalars['Boolean']['input']>;
  effect?: InputMaybe<Regex>;
  epic?: InputMaybe<Scalars['Boolean']['input']>;
  fun?: InputMaybe<Regex>;
  goal?: InputMaybe<IntFilter>;
  holoType?: InputMaybe<HoloType>;
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Regex>;
  number?: InputMaybe<Scalars['Int']['input']>;
  power?: InputMaybe<IntFilter>;
  rarity?: InputMaybe<Rarity>;
  type?: InputMaybe<Regex>;
};

export type CardWithHolo = {
  holo?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};

/** ISO 3166 Alpha-2 Country Codes */
export enum CountryA2 {
  Ad = 'AD',
  Ae = 'AE',
  Af = 'AF',
  Ag = 'AG',
  Ai = 'AI',
  Al = 'AL',
  Am = 'AM',
  An = 'AN',
  Ao = 'AO',
  Aq = 'AQ',
  Ar = 'AR',
  As = 'AS',
  At = 'AT',
  Au = 'AU',
  Aw = 'AW',
  Az = 'AZ',
  Ba = 'BA',
  Bb = 'BB',
  Bd = 'BD',
  Be = 'BE',
  Bf = 'BF',
  Bg = 'BG',
  Bh = 'BH',
  Bi = 'BI',
  Bj = 'BJ',
  Bm = 'BM',
  Bn = 'BN',
  Bo = 'BO',
  Br = 'BR',
  Bs = 'BS',
  Bt = 'BT',
  Bv = 'BV',
  Bw = 'BW',
  By = 'BY',
  Bz = 'BZ',
  Ca = 'CA',
  Cc = 'CC',
  Cd = 'CD',
  Cf = 'CF',
  Cg = 'CG',
  Ch = 'CH',
  Ci = 'CI',
  Ck = 'CK',
  Cl = 'CL',
  Cm = 'CM',
  Cn = 'CN',
  Co = 'CO',
  Cr = 'CR',
  Cu = 'CU',
  Cv = 'CV',
  Cx = 'CX',
  Cy = 'CY',
  Cz = 'CZ',
  De = 'DE',
  Dj = 'DJ',
  Dk = 'DK',
  Dm = 'DM',
  Do = 'DO',
  Dz = 'DZ',
  Ec = 'EC',
  Ee = 'EE',
  Eg = 'EG',
  Eh = 'EH',
  Er = 'ER',
  Es = 'ES',
  Et = 'ET',
  Fi = 'FI',
  Fj = 'FJ',
  Fk = 'FK',
  Fm = 'FM',
  Fo = 'FO',
  Fr = 'FR',
  Ga = 'GA',
  Gb = 'GB',
  Gd = 'GD',
  Ge = 'GE',
  Gf = 'GF',
  Gg = 'GG',
  Gh = 'GH',
  Gi = 'GI',
  Gl = 'GL',
  Gm = 'GM',
  Gn = 'GN',
  Gp = 'GP',
  Gq = 'GQ',
  Gr = 'GR',
  Gs = 'GS',
  Gt = 'GT',
  Gu = 'GU',
  Gw = 'GW',
  Gy = 'GY',
  Hk = 'HK',
  Hm = 'HM',
  Hn = 'HN',
  Hr = 'HR',
  Ht = 'HT',
  Hu = 'HU',
  Id = 'ID',
  Ie = 'IE',
  Il = 'IL',
  Im = 'IM',
  In = 'IN',
  Io = 'IO',
  Iq = 'IQ',
  Ir = 'IR',
  Is = 'IS',
  It = 'IT',
  Je = 'JE',
  Jm = 'JM',
  Jo = 'JO',
  Jp = 'JP',
  Ke = 'KE',
  Kg = 'KG',
  Kh = 'KH',
  Ki = 'KI',
  Km = 'KM',
  Kn = 'KN',
  Kp = 'KP',
  Kr = 'KR',
  Kw = 'KW',
  Ky = 'KY',
  Kz = 'KZ',
  La = 'LA',
  Lb = 'LB',
  Lc = 'LC',
  Li = 'LI',
  Lk = 'LK',
  Lr = 'LR',
  Ls = 'LS',
  Lt = 'LT',
  Lu = 'LU',
  Lv = 'LV',
  Ly = 'LY',
  Ma = 'MA',
  Mc = 'MC',
  Md = 'MD',
  Me = 'ME',
  Mg = 'MG',
  Mh = 'MH',
  Mk = 'MK',
  Ml = 'ML',
  Mm = 'MM',
  Mn = 'MN',
  Mo = 'MO',
  Mp = 'MP',
  Mq = 'MQ',
  Mr = 'MR',
  Ms = 'MS',
  Mt = 'MT',
  Mu = 'MU',
  Mv = 'MV',
  Mw = 'MW',
  Mx = 'MX',
  My = 'MY',
  Mz = 'MZ',
  Na = 'NA',
  Nc = 'NC',
  Ne = 'NE',
  Nf = 'NF',
  Ng = 'NG',
  Ni = 'NI',
  Nl = 'NL',
  No = 'NO',
  Np = 'NP',
  Nr = 'NR',
  Nu = 'NU',
  Nz = 'NZ',
  Om = 'OM',
  Pa = 'PA',
  Pe = 'PE',
  Pf = 'PF',
  Pg = 'PG',
  Ph = 'PH',
  Pk = 'PK',
  Pl = 'PL',
  Pm = 'PM',
  Pn = 'PN',
  Pr = 'PR',
  Ps = 'PS',
  Pt = 'PT',
  Pw = 'PW',
  Py = 'PY',
  Qa = 'QA',
  Re = 'RE',
  Ro = 'RO',
  Rs = 'RS',
  Ru = 'RU',
  Rw = 'RW',
  Sa = 'SA',
  Sb = 'SB',
  Sc = 'SC',
  Sd = 'SD',
  Se = 'SE',
  Sg = 'SG',
  Sh = 'SH',
  Si = 'SI',
  Sj = 'SJ',
  Sk = 'SK',
  Sl = 'SL',
  Sm = 'SM',
  Sn = 'SN',
  So = 'SO',
  Sr = 'SR',
  St = 'ST',
  Sv = 'SV',
  Sy = 'SY',
  Sz = 'SZ',
  Tc = 'TC',
  Td = 'TD',
  Tf = 'TF',
  Tg = 'TG',
  Th = 'TH',
  Tj = 'TJ',
  Tk = 'TK',
  Tl = 'TL',
  Tm = 'TM',
  Tn = 'TN',
  To = 'TO',
  Tr = 'TR',
  Tt = 'TT',
  Tv = 'TV',
  Tw = 'TW',
  Tz = 'TZ',
  Ua = 'UA',
  Ug = 'UG',
  Um = 'UM',
  Us = 'US',
  Uy = 'UY',
  Uz = 'UZ',
  Va = 'VA',
  Vc = 'VC',
  Ve = 'VE',
  Vg = 'VG',
  Vi = 'VI',
  Vn = 'VN',
  Vu = 'VU',
  Wf = 'WF',
  Ws = 'WS',
  Ye = 'YE',
  Yt = 'YT',
  Za = 'ZA',
  Zm = 'ZM',
  Zw = 'ZW'
}

export enum HoloType {
  Bubble = 'BUBBLE',
  Dots = 'DOTS',
  Shatter = 'SHATTER',
  Sheen = 'SHEEN'
}

/** - op and value are required, and will compare according to the [MongoDB Specification](https://www.mongodb.com/docs/manual/reference/operator/query-comparison/) */
export type IntFilter = {
  op?: InputMaybe<NumberOp>;
  value?: InputMaybe<Scalars['Int']['input']>;
};

export type InventoryItem = {
  __typename?: 'InventoryItem';
  card?: Maybe<Card>;
  holo?: Maybe<Scalars['Boolean']['output']>;
  quantity?: Maybe<Scalars['Int']['output']>;
  tradeQuantity?: Maybe<Scalars['Int']['output']>;
  wishQuantity?: Maybe<Scalars['Int']['output']>;
};

export enum NumberOp {
  Eq = 'eq',
  Gt = 'gt',
  Gte = 'gte',
  Lt = 'lt',
  Lte = 'lte',
  Ne = 'ne'
}

export type Query = {
  __typename?: 'Query';
  /** Gets the card with the given ID */
  card?: Maybe<Card>;
  /** Gets cards matching the optional filter */
  cards?: Maybe<Array<Maybe<Card>>>;
  /** Finds users with the cards provided available. If holoSensitive is false, will ignore holo status of trades */
  tradesForList?: Maybe<Array<Maybe<User>>>;
  /** Equivalent to `tradesForList` with `cards` equal to the user's cards with wishQuantity > 0. Will not return specified user. */
  tradesForUser?: Maybe<Array<Maybe<User>>>;
  user?: Maybe<User>;
};


export type QueryCardArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCardsArgs = {
  filter?: InputMaybe<CardFilter>;
};


export type QueryTradesForListArgs = {
  cards?: InputMaybe<Array<InputMaybe<CardWithHolo>>>;
  holoSensitive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryTradesForUserArgs = {
  holoSensitive?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export enum Rarity {
  C = 'C',
  R = 'R'
}

/**
 * - Pattern is required.
 * - Options are optional.
 * - `i`, `m`, `x`, and `s` are supported according
 * to the [MongoDB Specification](https://www.mongodb.com/docs/manual/reference/operator/query/regex/#mongodb-query-op.-options)
 */
export type Regex = {
  options?: InputMaybe<Scalars['String']['input']>;
  pattern: Scalars['String']['input'];
};

export type User = {
  __typename?: 'User';
  autoInventoryRules?: Maybe<Array<Maybe<AutoInventoryRule>>>;
  bio?: Maybe<Scalars['String']['output']>;
  completedTrades?: Maybe<Scalars['Int']['output']>;
  discordAvatar?: Maybe<Scalars['String']['output']>;
  discordBanner?: Maybe<Scalars['String']['output']>;
  discordBannerColor?: Maybe<Scalars['String']['output']>;
  discordDiscriminator: Scalars['String']['output'];
  discordUsername: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  inventory?: Maybe<Array<Maybe<InventoryItem>>>;
  lastOnline?: Maybe<Scalars['Date']['output']>;
  name: Scalars['String']['output'];
  region?: Maybe<CountryA2>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Artist: ResolverTypeWrapper<Artist>;
  AutoInventoryRule: ResolverTypeWrapper<AutoInventoryRule>;
  AutoInventoryRuleFilter: ResolverTypeWrapper<AutoInventoryRuleFilter>;
  AutoInventoryRuleQuantityCaseValuePair: ResolverTypeWrapper<AutoInventoryRuleQuantityCaseValuePair>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Card: ResolverTypeWrapper<Card>;
  CardFilter: CardFilter;
  CardWithHolo: CardWithHolo;
  CountryA2: CountryA2;
  Date: ResolverTypeWrapper<Scalars['Date']['output']>;
  HoloType: HoloType;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  IntFilter: IntFilter;
  InventoryItem: ResolverTypeWrapper<InventoryItem>;
  NumberOp: NumberOp;
  Query: ResolverTypeWrapper<{}>;
  Rarity: Rarity;
  Regex: Regex;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  User: ResolverTypeWrapper<User>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Artist: Artist;
  AutoInventoryRule: AutoInventoryRule;
  AutoInventoryRuleFilter: AutoInventoryRuleFilter;
  AutoInventoryRuleQuantityCaseValuePair: AutoInventoryRuleQuantityCaseValuePair;
  Boolean: Scalars['Boolean']['output'];
  Card: Card;
  CardFilter: CardFilter;
  CardWithHolo: CardWithHolo;
  Date: Scalars['Date']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  IntFilter: IntFilter;
  InventoryItem: InventoryItem;
  Query: {};
  Regex: Regex;
  String: Scalars['String']['output'];
  User: User;
};

export type ArtistResolvers<ContextType = any, ParentType extends ResolversParentTypes['Artist'] = ResolversParentTypes['Artist']> = {
  link?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AutoInventoryRuleResolvers<ContextType = any, ParentType extends ResolversParentTypes['AutoInventoryRule'] = ResolversParentTypes['AutoInventoryRule']> = {
  filter?: Resolver<Maybe<ResolversTypes['AutoInventoryRuleFilter']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tradeQuantity?: Resolver<Maybe<Array<Maybe<ResolversTypes['AutoInventoryRuleQuantityCaseValuePair']>>>, ParentType, ContextType>;
  wishQuantity?: Resolver<Maybe<Array<Maybe<ResolversTypes['AutoInventoryRuleQuantityCaseValuePair']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AutoInventoryRuleFilterResolvers<ContextType = any, ParentType extends ResolversParentTypes['AutoInventoryRuleFilter'] = ResolversParentTypes['AutoInventoryRuleFilter']> = {
  holo?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  rarity?: Resolver<Maybe<ResolversTypes['Rarity']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AutoInventoryRuleQuantityCaseValuePairResolvers<ContextType = any, ParentType extends ResolversParentTypes['AutoInventoryRuleQuantityCaseValuePair'] = ResolversParentTypes['AutoInventoryRuleQuantityCaseValuePair']> = {
  case?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  value?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CardResolvers<ContextType = any, ParentType extends ResolversParentTypes['Card'] = ResolversParentTypes['Card']> = {
  artists?: Resolver<Maybe<Array<Maybe<ResolversTypes['Artist']>>>, ParentType, ContextType>;
  cost?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  digital?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  effect?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  epic?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  fun?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  goal?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  holoType?: Resolver<Maybe<ResolversTypes['HoloType']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  power?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  rarity?: Resolver<Maybe<ResolversTypes['Rarity']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type InventoryItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['InventoryItem'] = ResolversParentTypes['InventoryItem']> = {
  card?: Resolver<Maybe<ResolversTypes['Card']>, ParentType, ContextType>;
  holo?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  quantity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tradeQuantity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  wishQuantity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  card?: Resolver<Maybe<ResolversTypes['Card']>, ParentType, ContextType, RequireFields<QueryCardArgs, 'id'>>;
  cards?: Resolver<Maybe<Array<Maybe<ResolversTypes['Card']>>>, ParentType, ContextType, Partial<QueryCardsArgs>>;
  tradesForList?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType, Partial<QueryTradesForListArgs>>;
  tradesForUser?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType, Partial<QueryTradesForUserArgs>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  autoInventoryRules?: Resolver<Maybe<Array<Maybe<ResolversTypes['AutoInventoryRule']>>>, ParentType, ContextType>;
  bio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  completedTrades?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  discordAvatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  discordBanner?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  discordBannerColor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  discordDiscriminator?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  discordUsername?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  inventory?: Resolver<Maybe<Array<Maybe<ResolversTypes['InventoryItem']>>>, ParentType, ContextType>;
  lastOnline?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  region?: Resolver<Maybe<ResolversTypes['CountryA2']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Artist?: ArtistResolvers<ContextType>;
  AutoInventoryRule?: AutoInventoryRuleResolvers<ContextType>;
  AutoInventoryRuleFilter?: AutoInventoryRuleFilterResolvers<ContextType>;
  AutoInventoryRuleQuantityCaseValuePair?: AutoInventoryRuleQuantityCaseValuePairResolvers<ContextType>;
  Card?: CardResolvers<ContextType>;
  Date?: GraphQLScalarType;
  InventoryItem?: InventoryItemResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

