// lib/aha.ts
// Utility to fetch data from Aha API

const AHA_API_KEY = process.env.AHA_API_KEY || "";
const AHA_BASE_URL = process.env.AHA_BASE_URL || "";

interface AhaRequestOptions {
  endpoint: string;
  params?: Record<string, string>;
}

export async function ahaFetch({ endpoint, params }: AhaRequestOptions) {
  const url = new URL(`${AHA_BASE_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${AHA_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Aha API error: ${res.status} - ${errorText}`);
  }

  return res.json();
}

// ============================================
// FETCH INITIATIVES
// ============================================
export async function fetchAhaInitiatives() {
  const data = await ahaFetch({
    endpoint: "/initiatives",
    params: { per_page: "50" },
  });

  return data.initiatives || [];
}

// ============================================
// FETCH SINGLE INITIATIVE
// ============================================
export async function fetchAhaInitiative(id: string) {
  const data = await ahaFetch({
    endpoint: `/initiatives/${id}`,
  });

  return data.initiative || null;
}

// ============================================
// FETCH FEATURES (for milestones/epics)
// ============================================
export async function fetchAhaFeatures(productId: string) {
  const data = await ahaFetch({
    endpoint: `/products/${productId}/features`,
    params: { per_page: "50" },
  });

  return data.features || [];
}

// ============================================
// MAP AHA DATA → GOVERNANCE TOWER FORMAT
// ============================================
export function mapAhaToInitiative(ahaInit: any) {
  // Map Aha status to our status enum
  let status = "ON_TRACK";
  const ahaStatus = (ahaInit.workflow_status?.name || "").toLowerCase();

  if (ahaStatus.includes("risk") || ahaStatus.includes("blocked")) {
    status = "AT_RISK";
  } else if (ahaStatus.includes("done") || ahaStatus.includes("complete")) {
    status = "COMPLETED";
  } else if (ahaStatus.includes("delay")) {
    status = "DELAYED";
  }

  return {
    name: ahaInit.name || "Untitled",
    owner: ahaInit.assigned_to_user?.name || null,
    capability: ahaInit.product?.name || null,
    box: null, // Aha doesn't have "box" natively; set manually or via custom field
    status,
    confidence: 75, // Default; will be computed by governance engine later
    ahaId: ahaInit.id || ahaInit.reference_num || null,
    ahaUrl: ahaInit.url || null,

    // Raw Aha data for reference
    ahaRaw: {
      id: ahaInit.id,
      reference_num: ahaInit.reference_num,
      workflow_status: ahaInit.workflow_status?.name,
      start_date: ahaInit.start_date,
      due_date: ahaInit.due_date,
      progress: ahaInit.progress,
      tags: ahaInit.tags,
    },
  };
}