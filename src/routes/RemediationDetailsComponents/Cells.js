import React from "react";
import { TextContent } from "@patternfly/react-core";
import PropTypes from "prop-types";
import InsightsLink from "@redhat-cloud-services/frontend-components/InsightsLink";



const APP_CONFIG = {
    advisor:          { app: "advisor",       label: "Advisor",       route: "recommendations" },
    vulnerabilities:  { app: "vulnerability", label: "Vulnerability",  route: "cves"          },
    ssg:              { app: "compliance",    label: "Compliance",     route: "reports"      },
    "patch-advisory": { app: "patch",         label: "Patch",          route: "advisories"   },
    "patch-package":  { app: "patch",         label: "Patch",          route: "packages"     },
  };
  
  function getAppInfo(key) {
    const [prefix] = key.split(":");
    return APP_CONFIG[prefix] || {
      app: prefix,
      label: prefix[0].toUpperCase() + prefix.slice(1),
      route: "",
    };
  }
  
  function buildToPath(key, description) {
    const { app, route } = getAppInfo(key);
  
    // compliance: no slug
    if (app === "compliance") {
      return `/${route}`;
    }
  
    // advisor: slug comes from the id
    let raw = app === "advisor"
      ? key.split(":")[1]
      : description.replace(/\s+/g, "_");
  
    // patch/packages: drop everything from first segment that starts with a digit
    if (route === "packages") {
        const parts = raw.split(/[-_]/);
        // only consider as version if it has a dot in it
        const cut = parts.findIndex(p => /^\d+\./.test(p));
        if (cut > 0) {
          raw = parts.slice(0, cut).join("-");
        }
      }
  
    const slug = encodeURIComponent(raw);
    return `/${route}/${slug}`;
  }
  
  export const ActionsCell = ({ id, description, resolution }) => {
    const { app } = getAppInfo(id);
  
    return (
      <TextContent>
        <InsightsLink app={app} to={buildToPath(id, description)}>
          {description}
        </InsightsLink>
        {resolution?.description && <p>{resolution.description}</p>}
      </TextContent>
    );
  };
export const RebootRequiredCell = ({ resolution }) => (
  <TextContent>
    {resolution?.needs_reboot ? "Required" : "Not required"}
  </TextContent>
);

//This has to open a modal
export const SystemsCell = ({ systems }) => (
  <TextContent style={{ justifySelf: "center" }}>{systems?.length}</TextContent>
);

export const IssueTypeCell = ({ id }) => (
  <TextContent>{getAppInfo(id)?.label}</TextContent>
);

ActionsCell.propTypes = {
  description: PropTypes.string.isRequired,
  resolution: PropTypes.shape({ description: PropTypes.string }),
  id: PropTypes.string.isRequired,
};
RebootRequiredCell.propTypes = {
  resolution: PropTypes.shape({ needs_reboot: PropTypes.bool }),
};
SystemsCell.propTypes = {
  systems: PropTypes.arrayOf(PropTypes.object),
};
IssueTypeCell.propTypes = {
  id: PropTypes.string.isRequired,
};
