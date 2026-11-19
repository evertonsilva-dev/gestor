import { onRequestDelete as __api_admin_periods__periodId__items__itemType___itemId__ts_onRequestDelete } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\periods\\[periodId]\\items\\[itemType]\\[itemId].ts"
import { onRequestPatch as __api_admin_periods__periodId__items__itemType___itemId__ts_onRequestPatch } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\periods\\[periodId]\\items\\[itemType]\\[itemId].ts"
import { onRequestDelete as __api_admin_organizations__organizationId__access_keys__accessKeyId__ts_onRequestDelete } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\organizations\\[organizationId]\\access-keys\\[accessKeyId].ts"
import { onRequestGet as __api_admin_organizations__organizationId__access_keys_ts_onRequestGet } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\organizations\\[organizationId]\\access-keys.ts"
import { onRequestPost as __api_admin_organizations__organizationId__access_keys_ts_onRequestPost } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\organizations\\[organizationId]\\access-keys.ts"
import { onRequestGet as __api_admin_periods__periodId__items_ts_onRequestGet } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\periods\\[periodId]\\items.ts"
import { onRequestPost as __api_admin_periods__periodId__items_ts_onRequestPost } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\periods\\[periodId]\\items.ts"
import { onRequestPost as __api_admin_periods__periodId__publish_ts_onRequestPost } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\periods\\[periodId]\\publish.ts"
import { onRequestPatch as __api_admin_channels__channelId__ts_onRequestPatch } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\channels\\[channelId].ts"
import { onRequestPatch as __api_admin_organizations__organizationId__ts_onRequestPatch } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\organizations\\[organizationId].ts"
import { onRequestPatch as __api_admin_topics__topicId__ts_onRequestPatch } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\topics\\[topicId].ts"
import { onRequestPatch as __api_admin_users__authUserId__ts_onRequestPatch } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\users\\[authUserId].ts"
import { onRequestGet as __api_admin_audit_ts_onRequestGet } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\audit.ts"
import { onRequestGet as __api_admin_channels_ts_onRequestGet } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\channels.ts"
import { onRequestPost as __api_admin_channels_ts_onRequestPost } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\channels.ts"
import { onRequestGet as __api_admin_organizations_ts_onRequestGet } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\organizations.ts"
import { onRequestPost as __api_admin_organizations_ts_onRequestPost } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\organizations.ts"
import { onRequestGet as __api_admin_periods_ts_onRequestGet } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\periods.ts"
import { onRequestPost as __api_admin_periods_ts_onRequestPost } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\periods.ts"
import { onRequestGet as __api_admin_topics_ts_onRequestGet } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\topics.ts"
import { onRequestPost as __api_admin_topics_ts_onRequestPost } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\topics.ts"
import { onRequestGet as __api_admin_users_ts_onRequestGet } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\users.ts"
import { onRequestPost as __api_admin_users_ts_onRequestPost } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\admin\\users.ts"
import { onRequestPost as __api_client_login_ts_onRequestPost } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\client\\login.ts"
import { onRequestPost as __api_client_logout_ts_onRequestPost } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\client\\logout.ts"
import { onRequestGet as __api_client_me_ts_onRequestGet } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\client\\me.ts"
import { onRequestGet as __api_dashboard_ts_onRequestGet } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\dashboard.ts"
import { onRequestGet as __api_me_ts_onRequestGet } from "C:\\Users\\emate\\Documents\\projetos\\amaso\\functions\\api\\me.ts"

export const routes = [
    {
      routePath: "/api/admin/periods/:periodId/items/:itemType/:itemId",
      mountPath: "/api/admin/periods/:periodId/items/:itemType",
      method: "DELETE",
      middlewares: [],
      modules: [__api_admin_periods__periodId__items__itemType___itemId__ts_onRequestDelete],
    },
  {
      routePath: "/api/admin/periods/:periodId/items/:itemType/:itemId",
      mountPath: "/api/admin/periods/:periodId/items/:itemType",
      method: "PATCH",
      middlewares: [],
      modules: [__api_admin_periods__periodId__items__itemType___itemId__ts_onRequestPatch],
    },
  {
      routePath: "/api/admin/organizations/:organizationId/access-keys/:accessKeyId",
      mountPath: "/api/admin/organizations/:organizationId/access-keys",
      method: "DELETE",
      middlewares: [],
      modules: [__api_admin_organizations__organizationId__access_keys__accessKeyId__ts_onRequestDelete],
    },
  {
      routePath: "/api/admin/organizations/:organizationId/access-keys",
      mountPath: "/api/admin/organizations/:organizationId",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_organizations__organizationId__access_keys_ts_onRequestGet],
    },
  {
      routePath: "/api/admin/organizations/:organizationId/access-keys",
      mountPath: "/api/admin/organizations/:organizationId",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_organizations__organizationId__access_keys_ts_onRequestPost],
    },
  {
      routePath: "/api/admin/periods/:periodId/items",
      mountPath: "/api/admin/periods/:periodId",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_periods__periodId__items_ts_onRequestGet],
    },
  {
      routePath: "/api/admin/periods/:periodId/items",
      mountPath: "/api/admin/periods/:periodId",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_periods__periodId__items_ts_onRequestPost],
    },
  {
      routePath: "/api/admin/periods/:periodId/publish",
      mountPath: "/api/admin/periods/:periodId",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_periods__periodId__publish_ts_onRequestPost],
    },
  {
      routePath: "/api/admin/channels/:channelId",
      mountPath: "/api/admin/channels",
      method: "PATCH",
      middlewares: [],
      modules: [__api_admin_channels__channelId__ts_onRequestPatch],
    },
  {
      routePath: "/api/admin/organizations/:organizationId",
      mountPath: "/api/admin/organizations",
      method: "PATCH",
      middlewares: [],
      modules: [__api_admin_organizations__organizationId__ts_onRequestPatch],
    },
  {
      routePath: "/api/admin/topics/:topicId",
      mountPath: "/api/admin/topics",
      method: "PATCH",
      middlewares: [],
      modules: [__api_admin_topics__topicId__ts_onRequestPatch],
    },
  {
      routePath: "/api/admin/users/:authUserId",
      mountPath: "/api/admin/users",
      method: "PATCH",
      middlewares: [],
      modules: [__api_admin_users__authUserId__ts_onRequestPatch],
    },
  {
      routePath: "/api/admin/audit",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_audit_ts_onRequestGet],
    },
  {
      routePath: "/api/admin/channels",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_channels_ts_onRequestGet],
    },
  {
      routePath: "/api/admin/channels",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_channels_ts_onRequestPost],
    },
  {
      routePath: "/api/admin/organizations",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_organizations_ts_onRequestGet],
    },
  {
      routePath: "/api/admin/organizations",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_organizations_ts_onRequestPost],
    },
  {
      routePath: "/api/admin/periods",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_periods_ts_onRequestGet],
    },
  {
      routePath: "/api/admin/periods",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_periods_ts_onRequestPost],
    },
  {
      routePath: "/api/admin/topics",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_topics_ts_onRequestGet],
    },
  {
      routePath: "/api/admin/topics",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_topics_ts_onRequestPost],
    },
  {
      routePath: "/api/admin/users",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_users_ts_onRequestGet],
    },
  {
      routePath: "/api/admin/users",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_users_ts_onRequestPost],
    },
  {
      routePath: "/api/client/login",
      mountPath: "/api/client",
      method: "POST",
      middlewares: [],
      modules: [__api_client_login_ts_onRequestPost],
    },
  {
      routePath: "/api/client/logout",
      mountPath: "/api/client",
      method: "POST",
      middlewares: [],
      modules: [__api_client_logout_ts_onRequestPost],
    },
  {
      routePath: "/api/client/me",
      mountPath: "/api/client",
      method: "GET",
      middlewares: [],
      modules: [__api_client_me_ts_onRequestGet],
    },
  {
      routePath: "/api/dashboard",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_dashboard_ts_onRequestGet],
    },
  {
      routePath: "/api/me",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_me_ts_onRequestGet],
    },
  ]