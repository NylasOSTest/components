import type { Manifest } from "@commons/types/Nylas";

export function getEventDispatcher(component: {
  dispatchEvent?: (e: Event) => boolean;
}) {
  return (name: string, detail: unknown): void => {
    if (component.dispatchEvent) {
      component.dispatchEvent(
        new CustomEvent(name, {
          detail,
          composed: true, // propagate across the shadow DOM
        }),
      );
    }
  };
}

export function debounce(
  fn: (args: unknown) => unknown,
  time: number,
): () => void {
  let timeoutId: number;
  return (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(fn, time);
  };
}

export function buildInternalProps<T extends Manifest>(
  properties: Partial<T>,
  manifest: Manifest,
  defaultValueMap: Partial<T>,
): Partial<T> {
  return new Proxy(defaultValueMap, {
    get: (target, name: keyof Manifest | "toJSON" | "toString") => {
      if (name === "toString" || name === "toJSON") {
        return () => JSON.stringify(target);
      }

      if (name in properties) {
        return getPropertyValue(properties[name], defaultValueMap[name]);
      }

      if (manifest && name in manifest) {
        return getPropertyValue(manifest[name], defaultValueMap[name]);
      }

      if (Reflect.get(target, name) !== undefined) {
        return getPropertyValue(
          Reflect.get(target, name),
          defaultValueMap[name],
        );
      }
      return null;
    },
  });
}

export function getPropertyValue<T>(propValue: any, defaultTo: T): T {
  if (propValue) {
    if (typeof defaultTo === "boolean") {
      return parseBoolean(propValue) as any;
    }
    if (typeof defaultTo === "number") {
      return Number(propValue) as any;
    }
  }

  return propValue === undefined ? defaultTo ?? null : propValue;
}

export function parseBoolean(
  val: string | boolean | undefined | null,
): boolean {
  return (<any>[true, "true", "1"]).includes(val);
}

export default function parseStringToArray(parseStr: string) {
  if (!parseStr) {
    return [];
  }

  if (parseStr.includes(",")) {
    return parseStr.split(",").map((s: string) => s.trim());
  }
  if (parseStr.includes(" ")) {
    return parseStr.split(" ").map((s: string) => s.trim());
  }
  if (parseStr.includes("\n")) {
    return parseStr.split("\n").map((s: string) => s.trim());
  }

  return [parseStr.trim()];
}
