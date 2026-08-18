import { DefaultAzureCredential } from "@azure/identity";

const ARM = "https://management.azure.com";
const ACCOUNT_API = "2025-06-01";
const SUBSCRIPTION_API = "2022-12-01";

const credential = new DefaultAzureCredential();

async function request(url) {
  const token = await credential.getToken(
    "https://management.azure.com/.default"
  );

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token.token}`,
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `Azure ARM ${response.status} ${response.statusText}\n${body}`
    );
  }

  return response.json();
}

async function list(url) {
  const rows = [];
  let next = url;

  while (next) {
    const data = await request(next);

    rows.push(...(data.value ?? []));
    next = data.nextLink ?? null;
  }

  return rows;
}

function resourceGroupFromId(id = "") {
  const match = id.match(/\/resourceGroups\/([^/]+)/i);
  return match?.[1] ?? "";
}

async function getSubscriptions() {
  const requested = process.env.AZURE_SUBSCRIPTION_ID;

  if (requested) {
    return [{ subscriptionId: requested, displayName: requested }];
  }

  return list(
    `${ARM}/subscriptions?api-version=${SUBSCRIPTION_API}`
  );
}

async function getFoundryAccounts(subscriptionId) {
  const accounts = await list(
    `${ARM}/subscriptions/${subscriptionId}` +
    `/providers/Microsoft.CognitiveServices/accounts` +
    `?api-version=${ACCOUNT_API}`
  );

  return accounts.filter(
    (account) =>
      String(account.kind).toLowerCase() === "aiservices"
  );
}

async function getProjects(subscriptionId, account) {
  const resourceGroup = resourceGroupFromId(account.id);

  return list(
    `${ARM}/subscriptions/${subscriptionId}` +
    `/resourceGroups/${encodeURIComponent(resourceGroup)}` +
    `/providers/Microsoft.CognitiveServices/accounts/` +
    `${encodeURIComponent(account.name)}/projects` +
    `?api-version=${ACCOUNT_API}`
  );
}

async function main() {
  console.log("\nMicrosoft Foundry Resource Audit");
  console.log("=".repeat(32));

  const subscriptions = await getSubscriptions();
  const output = [];

  for (const subscription of subscriptions) {
    const subscriptionId = subscription.subscriptionId;

    const accounts = await getFoundryAccounts(subscriptionId);

    for (const account of accounts) {
      const projects = await getProjects(subscriptionId, account);

      const base = {
        subscription:
          subscription.displayName ?? subscriptionId,
        subscriptionId,
        resourceGroup: resourceGroupFromId(account.id),
        foundryResource: account.name,
        location: account.location,
        sku: account.sku?.name ?? "",
        publicNetwork:
          account.properties?.publicNetworkAccess ?? "",
        projectManagement:
          account.properties?.allowProjectManagement ?? ""
      };

      if (projects.length === 0) {
        output.push({
          ...base,
          project: "-"
        });

        continue;
      }

      for (const project of projects) {
        output.push({
          ...base,
          project:
            project.properties?.displayName ??
            project.name
        });
      }
    }
  }

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  if (output.length === 0) {
    console.log("\nNo Microsoft Foundry resources found.");
    return;
  }

  console.table(output);

  console.log(
    `\nFound ${new Set(output.map(x => x.foundryResource)).size}` +
    ` Foundry resource(s) and ` +
    `${output.filter(x => x.project !== "-").length} project(s).`
  );
}

main().catch((error) => {
  console.error("\nFoundry audit failed:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
