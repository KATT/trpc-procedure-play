import { MiddlewareFunction } from './middleware';
import { Params } from './utils';
import { Parser, inferParser } from './parser';
import {
  DefaultValue as FallbackValue,
  Overwrite,
  ProcedureMarker,
  UnsetMarker,
} from './utils';

// type ProcedureBuilder
type MaybePromise<T> = T | Promise<T>;
interface ResolveOptions<TParams extends Params> {
  ctx: TParams['_ctx_out'];
  input: TParams['_input_out'];
}

type ClientContext = Record<string, unknown>;
type ProcedureOptions<TInput extends { input?: unknown }> = {
  context?: ClientContext;
} & TInput;

export type Procedure<TParams extends Params> =
  (TParams['_input_in'] extends UnsetMarker
    ? (
        opts?: ProcedureOptions<{ input?: undefined }>,
      ) => Promise<TParams['_output_out']>
    : TParams['_input_in'] extends undefined
    ? (
        opts?: ProcedureOptions<{ input?: TParams['_input_in'] }>,
      ) => Promise<TParams['_output_out']>
    : (
        opts: ProcedureOptions<{ input: TParams['_input_in'] }>,
      ) => Promise<TParams['_output_out']>) &
    ProcedureMarker;

type CreateProcedureReturnInput<
  TPrev extends Params,
  TNext extends Params,
> = ProcedureBuilder<{
  _meta: TPrev['_meta'];
  _ctx_in: TPrev['_ctx_in'];
  _ctx_out: Overwrite<TPrev['_ctx_out'], TNext['_ctx_out']>;
  _input_out: FallbackValue<TNext['_input_out'], TPrev['_input_out']>;
  _input_in: FallbackValue<TNext['_input_in'], TPrev['_input_in']>;
  _output_in: FallbackValue<TNext['_output_in'], TPrev['_output_in']>;
  _output_out: FallbackValue<TNext['_output_out'], TPrev['_output_out']>;
}>;

export interface ProcedureBuilder<TParams extends Params> {
  /**
   * Add an input parser to the procedure.
   */
  input<$TParser extends Parser>(
    schema: $TParser,
  ): ProcedureBuilder<{
    _meta: TParams['_meta'];
    _ctx_in: TParams['_ctx_in'];
    _ctx_out: TParams['_ctx_out'];
    _output_in: TParams['_output_in'];
    _output_out: TParams['_output_out'];
    _input_in: inferParser<$TParser>['in'];
    _input_out: inferParser<$TParser>['out'];
  }>;
  /**
   * Add an output parser to the procedure.
   */
  output<$TParser extends Parser>(
    schema: $TParser,
  ): ProcedureBuilder<{
    _meta: TParams['_meta'];
    _ctx_in: TParams['_ctx_in'];
    _ctx_out: TParams['_ctx_out'];
    _input_in: TParams['_input_in'];
    _input_out: TParams['_input_out'];
    _output_in: inferParser<$TParser>['in'];
    _output_out: inferParser<$TParser>['out'];
  }>;
  /**
   * Add a meta data to the procedure.
   */
  meta(meta: TParams['_meta']): ProcedureBuilder<TParams>;
  /**
   * Add a middleware to the procedure.
   */
  use<$TParams extends Params>(
    fn: MiddlewareFunction<TParams, $TParams>,
  ): CreateProcedureReturnInput<TParams, $TParams>;
  /**
   * Extend the procedure with another procedure
   */
  concat<$ProcedureReturnInput extends ProcedureBuilder<any>>(
    proc: $ProcedureReturnInput,
  ): $ProcedureReturnInput extends ProcedureBuilder<infer $TParams>
    ? CreateProcedureReturnInput<TParams, $TParams>
    : never;
  /**
   * Resolve the procedure
   */
  resolve<$TOutput>(
    resolver: (
      opts: ResolveOptions<TParams>,
    ) => MaybePromise<FallbackValue<TParams['_output_in'], $TOutput>>,
  ): UnsetMarker extends TParams['_output_out']
    ? Procedure<
        Overwrite<
          TParams,
          {
            _output_in: $TOutput;
            _output_out: $TOutput;
          }
        >
      >
    : Procedure<TParams>;
}

export function createBuilder<TContext, TMeta>(): ProcedureBuilder<{
  _ctx_in: TContext;
  _ctx_out: TContext;
  _input_out: UnsetMarker;
  _input_in: UnsetMarker;
  _output_in: UnsetMarker;
  _output_out: UnsetMarker;
  _meta: TMeta;
}> {
  throw new Error('unimplemented');
}
