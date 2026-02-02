// sanity.client.ts
// import "server-only";
import {
  createClient,
  type SanityClient,
  type ClientConfig,
  type QueryParams,
} from "@sanity/client";
import { projectId, dataset, apiVersion, token, studioUrl } from "./sanity.api";

/* -------------------------------------------------------
   Base config (PUBLISHED CONTENT)
------------------------------------------------------- */

export const baseConfig: ClientConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === "production",
  perspective: "published",
};

/* -------------------------------------------------------
   Server client (NO TOKEN by default)
------------------------------------------------------- */

const serverClient = createClient(baseConfig);

/* -------------------------------------------------------
   Preview client (DRAFTS + STEGA)
------------------------------------------------------- */

export function getPreviewClient(previewToken: string): SanityClient {
  if (!previewToken) {
    throw new Error("Preview token is required");
  }

  return createClient({
    ...baseConfig,
    token: previewToken,
    useCdn: false, // ⚠️ drafts must bypass CDN
    perspective: "previewDrafts",
    stega: {
      enabled: true,
      studioUrl,
    },
    ignoreBrowserTokenWarning: true,
  });
}

/* -------------------------------------------------------
   Typed fetch helper (ISR + tags)
------------------------------------------------------- */

type SanityFetchOptions = {
  query: string;
  qParams?: QueryParams;
  tags?: string[];
  preview?: {
    token: string;
  };
};

export async function sanityFetch<T>({
  query,
  qParams = {},
  tags = [],
  preview,
}: SanityFetchOptions): Promise<T> {
  const client = preview ? getPreviewClient(preview.token) : serverClient;

  return client.fetch<T>(query, qParams, {
    next: {
      revalidate: preview ? 0 : 300, // ❗ no cache in preview
      tags,
    },
  });
}

// // import "server-only";
// import {
//   createClient,
//   SanityClient,
//   type ClientConfig,
//   type QueryParams,
// } from "@sanity/client";
// import { projectId, dataset, apiVersion, token, studioUrl } from "./sanity.api";
// // import { draftMode } from "next/headers";
// // import { draftMode } from "next/headers";

// const config: ClientConfig = {
//   projectId,
//   dataset,
//   apiVersion,
//   // set CDN to live API in development mode
//   useCdn: process.env.NODE_ENV === "development" ? true : false,
//   // perspective: draftMode().isEnabled ? "previewDrafts" : "published",
//   token,
//   // stega: {
//   //   enabled: draftMode().isEnabled,
//   //   studioUrl: ,
//   // },
// };

// export const sanityConfig = {
//   projectId: projectId,
//   dataset: dataset,
// };

// const client = createClient(config);

// export function getClient(preview?: { token?: string }): SanityClient {
//   // import { draftMode } from "next/headers";
//   if (preview) {
//     if (!preview.token) {
//       throw new Error("You must provide a token to preview drafts");
//     }
//     console.log({ studioUrl });
//     return client.withConfig({
//       token: preview.token,
//       useCdn: false,
//       ignoreBrowserTokenWarning: true,
//       perspective: "previewDrafts",
//       stega: {
//         enabled: true,
//         studioUrl: studioUrl,
//       },
//     });
//   }
//   return client;
// }

// export async function sanityFetch<QueryResponse>({
//   query,
//   qParams = {},
//   tags,
// }: {
//   query: string;
//   qParams?: QueryParams;
//   tags: string[];
// }): Promise<QueryResponse> {
//   return client.fetch<QueryResponse>(query, qParams, {
//     // cache: process.env.NODE_ENV === "development" ? "no-store" : "force-cache",
//     cache: "no-store",
//     next: { tags },
//   });
// }
