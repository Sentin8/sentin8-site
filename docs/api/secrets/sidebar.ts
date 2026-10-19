import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "category",
      label: "policy",
      link: {
        type: "doc",
        id: "api/secrets/sentin-8-secrets-server",
      },
      items: [
        {
          type: "doc",
          id: "api/secrets/policy-list-attributes",
          label: "policy_list_attributes",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/policy-put-attribute",
          label: "policy_put_attribute",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/secrets/policy-delete-attribute",
          label: "policy_delete_attribute",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/secrets/policy-list-sets",
          label: "policy_list_sets",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/policy-mode-disable",
          label: "policy_mode_disable",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/policy-mode-enforce",
          label: "policy_mode_enforce",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/policy-mode-shadow",
          label: "policy_mode_shadow",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/policy-get-set",
          label: "policy_get_set",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/policy-put-set",
          label: "policy_put_set",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/secrets/policy-delete-set",
          label: "policy_delete_set",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/secrets/policy-test-set",
          label: "policy_test_set",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/policy-list-relations",
          label: "policy_list_relations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/policy-put-relation",
          label: "policy_put_relation",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/secrets/policy-delete-relation",
          label: "policy_delete_relation",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/secrets/policy-check-relation",
          label: "policy_check_relation",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "secrets",
      link: {
        type: "doc",
        id: "api/secrets/sentin-8-secrets-server",
      },
      items: [
        {
          type: "doc",
          id: "api/secrets/secrets-health",
          label: "`GET /v1/health` — custom payload (shell supplies the standard one too).\nHandle health handler.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/secrets-internal-schedules-run",
          label: "`POST /v1/internal/schedules/run` — Sentin8:Cron proxy-back target.\nMaintenance sweeps that must not depend on a user request:\n(a) `expiry-scan` — emits `sentin8:secrets:secret:expiring` for every\nsecret whose `expires_at` lands within the next 14 days (secrets\nREADME §7), (b) `version-prune` — drops prunable non-current versions\nusing the service's own prune window (SECRETS-2, secrets DESIGN §10:\nthe schedule is declared at boot next to `expiry-scan`). Authenticated\nby the cron ticker's M2M token (verified like any other principal\nunder Shield).",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/secret-list",
          label: "`GET /v1/secrets` — list metadata (names, versions, status — NEVER values).\nList secrets.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/secrets-maintenance-prune",
          label: "`POST /v1/secrets/maintenance/prune` — delete versions older than the\ncurrent one past the retention window (default 7d; `SENTIN8_SECRETS_PRUNE_DAYS`).\nIdempotent; safe to call from Sentin8:Cron (proxy-back). The reveal-audit\ntable is NEVER pruned (security-relevant history).\nHandle maintenance prune.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/secrets-maintenance-re-encrypt",
          label: "Handle maintenance re encrypt.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/secret-resolve",
          label: "Resolve secret.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/secret-get",
          label: "`GET /v1/secrets/{name}` — metadata for one secret (no value).\nFetch secret.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/secret-upsert",
          label: "Handle PUT secret.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/secrets/secret-delete",
          label: "`DELETE /v1/secrets/{name}` — soft-disable (status → disabled). Hard\ndelete is not exposed (values are purge-able via version prune only).\nDelete secret.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/secrets/secret-history",
          label: "`GET /v1/secrets/{name}/history` — version metadata list (no values).\nHandle secret history.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/secret-reads",
          label: "`GET /v1/secrets/{name}/reads` — reveal audit trail (admin).\nHandle secret reads.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/secret-reveal",
          label: "`GET /v1/secrets/{name}/reveal` — return the value. Admin scope; every\ncall writes a `reads` audit row.\nHandle reveal secret.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/secret-rotate",
          label: "`POST /v1/secrets/{name}/rotate` — new version from body value; the old\nversion is retained until the prune window.\nRotate secret.",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "admin-ui",
      items: [
        {
          type: "doc",
          id: "api/secrets/get-admin-data-secrets",
          label: "GET alias for `/v1/admin/secrets` — the POST-only literal on the same\npath shadows the `/v1/admin/{resource}` catch-all for GET requests\n(axum returns 405 instead of falling through), so the data read must be\nregistered explicitly, mirroring the db service pattern.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/admin-put-secret",
          label: "Handle admin put secret.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/admin-rotate-secret",
          label: "`POST /v1/admin/secrets/rotate` — rotate from the admin form. The\nprevious version is retained until the prune window.\nHandle admin rotate secret.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/admin-disable-secret",
          label: "Handle admin disable secret.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/admin-reveal-secret",
          label: "`POST /v1/admin/secrets/{name}/reveal` — explicit reveal action. Every\ncall writes a `reads` audit row; the value is returned once and\nnever cached by the UI.\nHandle admin reveal secret.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/secrets/get-admin-ui",
          label: "Fetch admin ui.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/secrets/get-admin-data",
          label: "`GET /v1/admin/{resource}` — returns a JSON array of admin data rows.",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
