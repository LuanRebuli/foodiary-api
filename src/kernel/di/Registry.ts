import { Constructor } from "@shared/types/Constructor";

export class Registry {
  private static instance: Registry | undefined;

  static getInstance() {
    if (!this.instance) {
      this.instance = new Registry();
    }

    return this.instance;
  }

  private constructor() {}

  private readonly providers = new Map<string, Registry.Provider>();

  register(impl: Constructor) {
    const token = impl.name;

    if (this.providers.has(token)) {
      throw new Error(`Provider with token "${token}" is already registered.`);
    }

    const deps = Reflect.getMetadata("design:paramtypes", impl) ?? [];

    this.providers.set(token, { impl, deps });
  }
  resolve<TImp extends Constructor>(impl: TImp): InstanceType<TImp> {
    const token = impl.name;
    const provider = this.providers.get(token);

    if (!provider) {
      throw new Error(`Provider with token "${token}" is not registered.`);
    }

    const deps = provider.deps.map((dep) => this.resolve(dep));
    const instace = new provider.impl(...deps);

    return instace;
  }
}

export namespace Registry {
  export type Provider = {
    impl: Constructor;
    deps: Constructor[];
  };
}
