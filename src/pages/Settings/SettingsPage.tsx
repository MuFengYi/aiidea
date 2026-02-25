import React from 'react';
import { Button } from 'antd';

const SettingsPage: React.FC = () => {
  return (
    <div className="aiidea-page">
      <div className="aiidea-section">
        <div className="aiidea-section-title">Language</div>
        <div className="aiidea-section-items">
          <div className="aiidea-setting-row">
            <div>Language</div>
            <div className="aiidea-setting-value">Default</div>
          </div>
        </div>
      </div>

      <div className="aiidea-section">
        <div className="aiidea-section-title">About</div>
        <div className="aiidea-section-items">
          <div className="aiidea-setting-row">
            <div>About AiiDea</div>
            <div className="aiidea-setting-value">v1.0</div>
          </div>
        </div>
      </div>

      <div className="aiidea-section">
        <div className="aiidea-section-title">iCloud</div>
        <div className="aiidea-section-items">
          <div className="aiidea-setting-row">
            <div>iCloud Status</div>
            <div className="aiidea-setting-value">Unavailable on Web</div>
          </div>
          <div className="aiidea-setting-row">
            <div>iCloud Backup</div>
            <Button size="small" disabled>
              Backup
            </Button>
          </div>
          <div className="aiidea-setting-row">
            <div>iCloud Sync</div>
            <Button size="small" disabled>
              Sync
            </Button>
          </div>
        </div>
      </div>

      <div className="aiidea-section">
        <div className="aiidea-section-title">Feedback</div>
        <div className="aiidea-section-items">
          <div className="aiidea-setting-row">
            <div>Feedback</div>
            <a className="aiidea-link" href="mailto:yi.crazy@icloud.com">
              Send Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
