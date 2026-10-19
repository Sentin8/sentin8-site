import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "category",
      label: "policy",
      link: {
        type: "doc",
        id: "api/acme/sentin-8-acme",
      },
      items: [
        {
          type: "doc",
          id: "api/acme/policy-list-attributes",
          label: "policy_list_attributes",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/acme/policy-put-attribute",
          label: "policy_put_attribute",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/acme/policy-delete-attribute",
          label: "policy_delete_attribute",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/acme/policy-delete-attribute-path",
          label: "policy_delete_attribute_path",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/acme/policy-list-decisions",
          label: "policy_list_decisions",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/acme/policy-list-sets",
          label: "policy_list_sets",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/acme/policy-create-set",
          label: "policy_create_set",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/acme/policy-mode-disable",
          label: "policy_mode_disable",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/acme/policy-mode-enforce",
          label: "policy_mode_enforce",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/acme/policy-mode-shadow",
          label: "policy_mode_shadow",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/acme/policy-get-set",
          label: "policy_get_set",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/acme/policy-put-set",
          label: "policy_put_set",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/acme/policy-delete-set",
          label: "policy_delete_set",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/acme/policy-save-set",
          label: "policy_save_set",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/acme/policy-test-set",
          label: "policy_test_set",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/acme/policy-flip-set",
          label: "policy_flip_set",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/acme/policy-list-relations",
          label: "policy_list_relations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/acme/policy-put-relation",
          label: "policy_put_relation",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api/acme/policy-delete-relation",
          label: "policy_delete_relation",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api/acme/policy-check-relation",
          label: "policy_check_relation",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/acme/policy-delete-relation-path",
          label: "policy_delete_relation_path",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "acme",
      link: {
        type: "doc",
        id: "api/acme/sentin-8-acme",
      },
      items: [
        {
          type: "doc",
          id: "api/acme/serve-challenge-token",
          label: "Serve an http-01 key authorization for the upstream CA's validator\n(DESIGN §4.3): `GET /.well-known/acme-challenge/{token}`. The proxy's\n:80 listener forwards here; the bounded map holds only tokens captured\nfor in-flight external orders. Unauthenticated by design (RFC 8555\n§8.1) — the token itself is the capability.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/acme/get-authz",
          label: "`GET /acme/authz/{id}` — fetch an authorization (RFC 8555 §7.1.4).",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/acme/get-cert",
          label: "`GET /acme/cert/{id}` — download the certificate as a combined PEM\n(chain, plus the private key for locally-issued certs so TLS can build\nits `ServerConfig` from one artifact).",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/acme/challenge-ready",
          label: "`POST /acme/challenge/{id}` — signal the challenge is ready for\nvalidation (RFC 8555 §8.3). Local orders short-circuit to `valid`\n(the challenge target is the platform's own host network); external\norders notify the upstream CA that its http-01 challenge is ready —\nthe upstream then fetches the key authorization from the proxy's\n:80 listener → acme's well-known route (DESIGN §4.2/§4.3).",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/acme/directory-handler",
          label: "`GET /acme/directory` — ACME directory object (RFC 8555 §7.1.1).",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/acme/new-account",
          label: "`POST /acme/new-account` — register a new ACME account (RFC 8555 §7.1.2),\npersisted to the accounts directory and announced as\n`sentin8:acme:account:created`.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/acme/new-order",
          label: "`POST /acme/new-order` — create an order (RFC 8555 §7.1.3).",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/acme/get-order",
          label: "`GET /acme/order/{id}` — fetch the order status.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/acme/finalize-order",
          label: "`POST /acme/order/{id}/finalize` — submit the CSR and issue the\ncertificate (RFC 8555 §7.4). Local orders require a VALID\nauthorization (defense in depth — the challenge short-circuit set it;\nan order that never proved control is never signed) and are signed\nby the Intermediate CA; external orders are finalized upstream\nthrough the relay and the certificate cached (DESIGN §4.2).",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/acme/revoke-cert",
          label: "`POST /acme/revoke-cert` — revoke a certificate (RFC 8555 §7.6),\nmarking its metadata and announcing `sentin8:acme:certificate:revoked`.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/acme/ca-intermediate",
          label: "`GET /v1/ca/intermediate.crt` — download the Intermediate CA certificate.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/acme/ca-root",
          label: "`GET /v1/ca/root.crt` — download the Root CA certificate.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/acme/client-cert-issue",
          label: "`POST /v1/client-cert` — mint an mTLS client certificate.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/acme/internal-schedules-run",
          label: "`POST /v1/internal/schedules/run` — Sentin8:Cron proxy-back target for\nthe daily leaf-cert renewal sweep. Scans the certificates directory\nfor locally-issued (`source = 'local'`) certs whose `expires_at` lands\nwithin the next 14 days and re-issues each one (new key + full chain\nvia the same `sign_leaf` path as order finalize); the previous cert\nstays on disk until its natural expiry (overlap). Authenticated by the\ncron ticker's M2M token.",
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
          id: "api/acme/revoke-certificate",
          label: "`POST /v1/admin/certificates/{id}/revoke` — revoke an issued certificate.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/acme/get-admin-ui",
          label: "`GET /v1/admin/ui/{*page}` — returns the RFW page definition as JSON.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api/acme/get-admin-data",
          label: "`GET /v1/admin/{resource}` — returns a JSON array of admin data rows.",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "meta",
      items: [
        {
          type: "doc",
          id: "api/acme/health",
          label: "Liveness (captain monitor payload).",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
