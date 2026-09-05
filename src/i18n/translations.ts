export type Language = 'en' | 'tr';

export interface TranslationDictionary {
  // Brand & Header
  brandName: string;
  brandTagline: string;
  serversCount: string;
  connectServer: string;
  smtpSettings: string;
  logout: string;
  login: string;
  register: string;
  themeToggle: string;
  languageToggle: string;
  notifications: string;

  // Auth
  authTitle: string;
  authSubtitle: string;
  tabLogin: string;
  tabRegister: string;
  username: string;
  usernameOrEmail: string;
  email: string;
  password: string;
  confirmPassword: string;
  captchaLabel: string;
  captchaPlaceholder: string;
  captchaRefresh: string;
  captchaHint: string;
  forgotPassword: string;
  backToLogin: string;
  resetPasswordTitle: string;
  resetPasswordSubtitle: string;
  sendResetLink: string;
  resetToken: string;
  newPassword: string;
  updatePasswordBtn: string;
  demoAccountsTitle: string;
  loginAsOwner: string;
  loginAsMember: string;
  roleOwner: string;
  roleMember: string;
  passwordsDoNotMatch: string;
  invalidCaptcha: string;
  loggingIn: string;
  registering: string;

  // Server List
  myServers: string;
  myServersDesc: string;
  searchServers: string;
  filterAll: string;
  filterOnline: string;
  filterOffline: string;
  noServersFound: string;
  noServersMatching: string;
  connectFirstServer: string;
  serverCardVcpu: string;
  serverCardRam: string;
  serverCardDisk: string;
  serverCardBw: string;
  serverCardOwnerBadge: string;
  serverCardMemberBadge: string;
  serverStatusOnline: string;
  serverStatusOffline: string;
  serverStatusRebooting: string;
  serverStatusStopped: string;

  // Connect Server Modal
  connectModalTitle: string;
  connectModalDesc: string;
  serverName: string;
  serverNamePlaceholder: string;
  hostname: string;
  hostnamePlaceholder: string;
  ipAddress: string;
  ipAddressPlaceholder: string;
  privateIp: string;
  privateIpPlaceholder: string;
  ipv6Address: string;
  ipv6Placeholder: string;
  sshPort: string;
  sshUser: string;
  authMethod: string;
  authMethodPassword: string;
  authMethodKey: string;
  passwordOrKey: string;
  osDistribution: string;
  serverRegion: string;
  specsVcpu: string;
  specsRam: string;
  specsDisk: string;
  specsBandwidth: string;
  btnConnectServer: string;
  connectingServer: string;

  // Server Detail Tabs
  tabControlPanel: string;
  tabConsole: string;
  tabFiles: string;
  tabNetwork: string;
  tabMembers: string;
  tabSettings: string;
  tabActivity: string;
  backToDashboard: string;

  // Dashboard Tab
  hardwareMetrics: string;
  cpuUsage: string;
  ramUsage: string;
  diskUsage: string;
  networkTraffic: string;
  trafficIn: string;
  trafficOut: string;
  uptime: string;
  loadAverage: string;
  liveHardwareChart: string;
  powerControls: string;
  btnStart: string;
  btnGracefulReboot: string;
  btnForceReboot: string;
  btnGracefulShutdown: string;
  btnForceKill: string;
  confirmPowerAction: string;
  confirmPowerDesc: string;
  runningProcesses: string;
  processesDesc: string;
  procPid: string;
  procUser: string;
  procCpu: string;
  procMem: string;
  procCommand: string;
  procStatus: string;
  procAction: string;
  killProc: string;

  // Console Tab
  consoleTitle: string;
  consoleDesc: string;
  consoleStatusConnected: string;
  consoleStatusDisconnected: string;
  consolePlaceholder: string;
  btnClear: string;
  btnCopy: string;
  btnFullscreen: string;
  btnExitFullscreen: string;
  quickCommands: string;
  copiedToClipboard: string;

  // Files Tab
  filesTitle: string;
  filesDesc: string;
  currentDirectory: string;
  btnNewFile: string;
  btnNewFolder: string;
  btnUpload: string;
  fileName: string;
  fileSize: string;
  filePermissions: string;
  fileOwner: string;
  fileModified: string;
  fileActions: string;
  editFile: string;
  renameFile: string;
  changePermissions: string;
  deleteFile: string;
  downloadFile: string;
  confirmDeleteFile: string;
  confirmDeleteFileDesc: string;
  fileEditorTitle: string;
  btnSaveFile: string;
  savingFile: string;
  chmodModalTitle: string;
  chmodNumeric: string;
  uploadModalTitle: string;
  dragDropFiles: string;

  // Network Tab
  networkTitle: string;
  networkDesc: string;
  assignedIps: string;
  publicIpv4: string;
  privateIpv4: string;
  publicIpv6: string;
  portForwarding: string;
  portForwardingDesc: string;
  btnAddPort: string;
  publicPort: string;
  internalPort: string;
  protocol: string;
  description: string;
  firewallRules: string;
  firewallRulesDesc: string;
  ufwStatus: string;
  btnAddRule: string;
  ruleAction: string;
  ruleProtocol: string;
  rulePort: string;
  ruleSource: string;
  ruleComment: string;
  dnsManagement: string;
  dnsManagementDesc: string;
  btnAddDns: string;
  dnsType: string;
  dnsName: string;
  dnsValue: string;
  dnsTtl: string;
  dnsPriority: string;

  // Members Tab (RBAC)
  membersTitle: string;
  membersDesc: string;
  serverOwnerBadge: string;
  btnAddMember: string;
  memberUsernameInput: string;
  memberUsernamePlaceholder: string;
  memberPermissionsTitle: string;
  permPower: string;
  permPowerDesc: string;
  permConsole: string;
  permConsoleDesc: string;
  permFiles: string;
  permFilesDesc: string;
  permNetwork: string;
  permNetworkDesc: string;
  permViewOnly: string;
  permViewOnlyDesc: string;
  btnSavePermissions: string;
  btnRemoveMember: string;
  confirmRemoveMember: string;
  confirmRemoveMemberDesc: string;
  onlyOwnerCanManage: string;

  // Settings Tab
  serverSettingsTitle: string;
  serverSettingsDesc: string;
  saveSettingsBtn: string;
  dangerZone: string;
  dangerZoneDesc: string;
  deleteServerBtn: string;
  confirmDeleteServer: string;
  confirmDeleteServerDesc: string;

  // SMTP Settings Modal
  smtpModalTitle: string;
  smtpModalDesc: string;
  smtpHost: string;
  smtpPort: string;
  smtpSecureTls: string;
  smtpUsername: string;
  smtpPassword: string;
  smtpFromName: string;
  smtpFromEmail: string;
  btnSaveSmtp: string;
  btnTestSmtp: string;
  smtpTesting: string;
  smtpTestRecipient: string;
  smtpDiagnosticLogs: string;
  emailHistoryTab: string;
  smtpConfigTab: string;
  noEmailLogs: string;
  recipient: string;
  subject: string;
  status: string;
  date: string;

  // Common UI
  cancel: string;
  delete: string;
  save: string;
  confirm: string;
  close: string;
  loading: string;
  success: string;
  error: string;
  copied: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    brandName: 'FLUX HOSTING',
    brandTagline: 'VDS / VPS Control Panel & Infrastructure',
    serversCount: 'Connected Nodes',
    connectServer: 'Connect Server',
    smtpSettings: 'SMTP Mailer',
    logout: 'Sign Out',
    login: 'Sign In',
    register: 'Create Account',
    themeToggle: 'Toggle Theme (Dark / Light)',
    languageToggle: 'Change Language',
    notifications: 'Notifications',

    authTitle: 'Access Flux Control Plane',
    authSubtitle: 'Manage your bare-metal VDS, cloud VPS nodes, and firewall rules in real time.',
    tabLogin: 'Sign In',
    tabRegister: 'Create Account',
    username: 'Username',
    usernameOrEmail: 'Username or Email',
    email: 'Email Address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    captchaLabel: 'Security Verification',
    captchaPlaceholder: 'Enter puzzle solution',
    captchaRefresh: 'Refresh CAPTCHA',
    captchaHint: 'Solve the security puzzle above to proceed.',
    forgotPassword: 'Forgot password?',
    backToLogin: 'Back to sign in',
    resetPasswordTitle: 'Reset Password',
    resetPasswordSubtitle: 'Enter your email address to receive password recovery instructions.',
    sendResetLink: 'Send Recovery Link',
    resetToken: 'Recovery Token',
    newPassword: 'New Password',
    updatePasswordBtn: 'Update Password',
    demoAccountsTitle: 'Quick Demo Sign-In:',
    loginAsOwner: 'Login as Server Owner',
    loginAsMember: 'Login as Team Member',
    roleOwner: 'Server Owner',
    roleMember: 'Team Member',
    passwordsDoNotMatch: 'Passwords do not match.',
    invalidCaptcha: 'Please complete the CAPTCHA verification.',
    loggingIn: 'Authenticating...',
    registering: 'Creating account & provisioning node...',

    myServers: 'Server Fleet',
    myServersDesc: 'Real-time overview of your connected VDS and VPS instances.',
    searchServers: 'Search servers by name, IP, or hostname...',
    filterAll: 'All Nodes',
    filterOnline: 'Online',
    filterOffline: 'Offline / Stopped',
    noServersFound: 'No servers connected yet.',
    noServersMatching: 'No servers match your search filter.',
    connectFirstServer: 'Connect Your First Server',
    serverCardVcpu: 'vCPU',
    serverCardRam: 'RAM',
    serverCardDisk: 'NVMe',
    serverCardBw: 'Bandwidth',
    serverCardOwnerBadge: 'Owner',
    serverCardMemberBadge: 'Member Access',
    serverStatusOnline: 'Online',
    serverStatusOffline: 'Offline',
    serverStatusRebooting: 'Rebooting',
    serverStatusStopped: 'Stopped',

    connectModalTitle: 'Connect New VDS / VPS',
    connectModalDesc: 'Add an existing Linux server instance to the Flux Hosting control panel.',
    serverName: 'Server Label / Name',
    serverNamePlaceholder: 'e.g. Frankfurt Web Node 01',
    hostname: 'Hostname / FQDN',
    hostnamePlaceholder: 'e.g. node01.example.com',
    ipAddress: 'Public IPv4 Address',
    ipAddressPlaceholder: 'e.g. 185.193.124.42',
    privateIp: 'Private IPv4 (Optional)',
    privateIpPlaceholder: 'e.g. 10.0.4.12',
    ipv6Address: 'IPv6 Address (Optional)',
    ipv6Placeholder: 'e.g. 2a01:4f8:c012::1',
    sshPort: 'SSH Port',
    sshUser: 'SSH Username',
    authMethod: 'Authentication Method',
    authMethodPassword: 'Password',
    authMethodKey: 'SSH Private Key',
    passwordOrKey: 'SSH Password or Private Key',
    osDistribution: 'Operating System',
    serverRegion: 'Datacenter / Region',
    specsVcpu: 'vCPU Cores',
    specsRam: 'Memory (RAM in MB)',
    specsDisk: 'Storage (NVMe in GB)',
    specsBandwidth: 'Bandwidth Quota (TB)',
    btnConnectServer: 'Establish Connection',
    connectingServer: 'Connecting & Verifying...',

    tabControlPanel: 'Control Panel',
    tabConsole: 'Terminal Console',
    tabFiles: 'File Manager',
    tabNetwork: 'Network & Firewall',
    tabMembers: 'Access & Members',
    tabSettings: 'Server Settings',
    tabActivity: 'Audit Log',
    backToDashboard: 'Back to Fleet',

    hardwareMetrics: 'Hardware Utilization',
    cpuUsage: 'CPU Utilization',
    ramUsage: 'Memory (RAM)',
    diskUsage: 'Disk Usage',
    networkTraffic: 'Network I/O',
    trafficIn: 'Inbound',
    trafficOut: 'Outbound',
    uptime: 'System Uptime',
    loadAverage: 'Load Average (1m, 5m, 15m)',
    liveHardwareChart: 'Real-Time Hardware Load (Live Stream)',
    powerControls: 'Power Management',
    btnStart: 'Boot Server',
    btnGracefulReboot: 'Reboot (Graceful)',
    btnForceReboot: 'Force Reboot',
    btnGracefulShutdown: 'Shutdown (ACPI)',
    btnForceKill: 'Force Kill (Power Off)',
    confirmPowerAction: 'Confirm Power Action',
    confirmPowerDesc: 'Are you sure you want to perform this power operation on the server?',
    runningProcesses: 'Active Processes',
    processesDesc: 'Real-time task manager and resource consumption per daemon.',
    procPid: 'PID',
    procUser: 'User',
    procCpu: 'CPU %',
    procMem: 'MEM %',
    procCommand: 'Command',
    procStatus: 'Status',
    procAction: 'Action',
    killProc: 'Terminate',

    consoleTitle: 'Interactive Web Shell',
    consoleDesc: 'Direct pseudo-terminal connection to the server agent via encrypted tunnel.',
    consoleStatusConnected: 'Connected (SSH TTY)',
    consoleStatusDisconnected: 'Disconnected',
    consolePlaceholder: 'Type bash command and press Enter (e.g., top, df -h, systemctl, ls, ufw)...',
    btnClear: 'Clear Screen',
    btnCopy: 'Copy Logs',
    btnFullscreen: 'Toggle Fullscreen',
    btnExitFullscreen: 'Exit Fullscreen',
    quickCommands: 'Quick Shortcuts:',
    copiedToClipboard: 'Copied to clipboard.',

    filesTitle: 'Server File Manager',
    filesDesc: 'Browse, edit, upload, and configure Linux filesystem permissions in real time.',
    currentDirectory: 'Path:',
    btnNewFile: 'New File',
    btnNewFolder: 'New Folder',
    btnUpload: 'Upload File',
    fileName: 'Name',
    fileSize: 'Size',
    filePermissions: 'Permissions',
    fileOwner: 'Owner / Group',
    fileModified: 'Last Modified',
    fileActions: 'Actions',
    editFile: 'Edit Text',
    renameFile: 'Rename / Move',
    changePermissions: 'Chmod',
    deleteFile: 'Delete',
    downloadFile: 'Download',
    confirmDeleteFile: 'Delete Item',
    confirmDeleteFileDesc: 'Are you sure you want to permanently delete this file or directory?',
    fileEditorTitle: 'Text File Editor',
    btnSaveFile: 'Save Changes (Ctrl+S)',
    savingFile: 'Saving file...',
    chmodModalTitle: 'Change File Permissions (chmod)',
    chmodNumeric: 'Octal Notation (e.g. 0755, 0644, 0600)',
    uploadModalTitle: 'Upload Files to Server',
    dragDropFiles: 'Drag & drop text or configuration files here, or click to browse',

    networkTitle: 'Networking & Security Rules',
    networkDesc: 'Configure assigned IP addresses, port forwardings, UFW firewall rules, and DNS records.',
    assignedIps: 'Assigned IP Addresses',
    publicIpv4: 'Public IPv4',
    privateIpv4: 'Private IPv4',
    publicIpv6: 'Public IPv6',
    portForwarding: 'Port Forwarding & NAT Allocations',
    portForwardingDesc: 'Route external incoming ports directly to container or internal ports.',
    btnAddPort: 'Add Port Forwarding',
    publicPort: 'Public Port',
    internalPort: 'Internal Port',
    protocol: 'Protocol',
    description: 'Description',
    firewallRules: 'Firewall Rules (UFW / iptables)',
    firewallRulesDesc: 'Define packet filter rules to allow or deny incoming traffic.',
    ufwStatus: 'UFW Daemon Status: Active',
    btnAddRule: 'Add Firewall Rule',
    ruleAction: 'Action (ALLOW / DENY)',
    ruleProtocol: 'Protocol',
    rulePort: 'Port / Port Range',
    ruleSource: 'Source Subnet (CIDR)',
    ruleComment: 'Rule Comment',
    dnsManagement: 'DNS Zone Records',
    dnsManagementDesc: 'Manage authoritative DNS mappings for domains bound to this node.',
    btnAddDns: 'Add DNS Record',
    dnsType: 'Type (A, AAAA, CNAME, TXT, MX)',
    dnsName: 'Record Hostname / Name',
    dnsValue: 'Target Value / IP',
    dnsTtl: 'TTL (Seconds)',
    dnsPriority: 'Priority',

    membersTitle: 'Access Control & Team Members (RBAC)',
    membersDesc: 'Only the server owner can invite members and configure granular panel permissions.',
    serverOwnerBadge: 'Primary Server Owner',
    btnAddMember: 'Add Member by Username',
    memberUsernameInput: 'Member Username or Email',
    memberUsernamePlaceholder: 'Enter registered username or email...',
    memberPermissionsTitle: 'Member Access Permissions',
    permPower: 'Power Management',
    permPowerDesc: 'Can start, reboot, and shut down this server instance.',
    permConsole: 'Interactive Web Console',
    permConsoleDesc: 'Can open terminal and execute commands on this node.',
    permFiles: 'File Manager & Editor',
    permFilesDesc: 'Can browse, edit, upload, and delete files on the server.',
    permNetwork: 'Network & Firewall',
    permNetworkDesc: 'Can modify firewall rules and port allocations.',
    permViewOnly: 'View-Only Mode',
    permViewOnlyDesc: 'Restricts user to read-only visibility with no action capabilities.',
    btnSavePermissions: 'Update Permissions',
    btnRemoveMember: 'Revoke Access',
    confirmRemoveMember: 'Revoke Member Access',
    confirmRemoveMemberDesc: 'Are you sure you want to remove this member from managing this server?',
    onlyOwnerCanManage: 'Only the server owner can add, modify, or remove member permissions.',

    serverSettingsTitle: 'Server Parameters & Metadata',
    serverSettingsDesc: 'Update hostname, SSH port, and hardware spec assignments.',
    saveSettingsBtn: 'Save Server Configuration',
    dangerZone: 'Danger Zone',
    dangerZoneDesc: 'Irreversible operations on this virtual server.',
    deleteServerBtn: 'Delete / Disconnect Node',
    confirmDeleteServer: 'Delete Server Node',
    confirmDeleteServerDesc: 'This will completely unregister and disconnect this server from your Flux panel. This action cannot be undone.',

    smtpModalTitle: 'SMTP Email Service Configuration',
    smtpModalDesc: 'Configure mail transfer agent for automated verification emails, notifications, and security alerts.',
    smtpHost: 'SMTP Host / Relay',
    smtpPort: 'SMTP Port (e.g. 587, 465, 25)',
    smtpSecureTls: 'Use SSL/TLS (Implicit)',
    smtpUsername: 'SMTP Username',
    smtpPassword: 'SMTP Password',
    smtpFromName: 'Sender Display Name',
    smtpFromEmail: 'From / Sender Email Address',
    btnSaveSmtp: 'Save SMTP Configuration',
    btnTestSmtp: 'Test SMTP Connection',
    smtpTesting: 'Testing SMTP Connection...',
    smtpTestRecipient: 'Send Test Diagnostic Email To:',
    smtpDiagnosticLogs: 'Diagnostic Handshake Output:',
    emailHistoryTab: 'Outbox History',
    smtpConfigTab: 'Connection Setup',
    noEmailLogs: 'No emails sent yet.',
    recipient: 'Recipient',
    subject: 'Subject',
    status: 'Status',
    date: 'Timestamp',

    cancel: 'Cancel',
    delete: 'Delete',
    save: 'Save Changes',
    confirm: 'Confirm',
    close: 'Close',
    loading: 'Processing...',
    success: 'Operation completed successfully.',
    error: 'An error occurred.',
    copied: 'Copied!',
  },

  tr: {
    brandName: 'FLUX HOSTING',
    brandTagline: 'VDS / VPS Kontrol Paneli ve Altyapı Yönetimi',
    serversCount: 'Bağlı Sunucular',
    connectServer: 'Sunucu Bağla',
    smtpSettings: 'SMTP Posta',
    logout: 'Çıkış Yap',
    login: 'Giriş Yap',
    register: 'Hesap Oluştur',
    themeToggle: 'Tema Değiştir (Koyu / Açık)',
    languageToggle: 'Dili Değiştir',
    notifications: 'Bildirimler',

    authTitle: 'Flux Kontrol Paneline Erişin',
    authSubtitle: 'VDS, bulut VPS sunucularınızı ve güvenlik duvarınızı gerçek zamanlı yönetin.',
    tabLogin: 'Giriş Yap',
    tabRegister: 'Kayıt Ol',
    username: 'Kullanıcı Adı',
    usernameOrEmail: 'Kullanıcı Adı veya E-posta',
    email: 'E-posta Adresi',
    password: 'Şifre',
    confirmPassword: 'Şifre Tekrar',
    captchaLabel: 'Güvenlik Doğrulaması (CAPTCHA)',
    captchaPlaceholder: 'Doğrulama kodunu giriniz',
    captchaRefresh: 'Yenile',
    captchaHint: 'İşleme devam etmek için yukarıdaki güvenlik sorusunu çözünüz.',
    forgotPassword: 'Şifrenizi mi unuttunuz?',
    backToLogin: 'Giriş ekranına dön',
    resetPasswordTitle: 'Şifre Sıfırlama',
    resetPasswordSubtitle: 'Şifre sıfırlama bağlantısı almak için e-posta adresinizi giriniz.',
    sendResetLink: 'Sıfırlama Bağlantısı Gönder',
    resetToken: 'Kurtarma Kodu',
    newPassword: 'Yeni Şifre',
    updatePasswordBtn: 'Şifreyi Güncelle',
    demoAccountsTitle: 'Hızlı Test Girişi:',
    loginAsOwner: 'Sunucu Sahibi Olarak Giriş',
    loginAsMember: 'Ekip Üyesi Olarak Giriş',
    roleOwner: 'Sunucu Sahibi',
    roleMember: 'Ekip Üyesi',
    passwordsDoNotMatch: 'Girdiğiniz şifreler birbiriyle eşleşmiyor.',
    invalidCaptcha: 'Lütfen güvenlik doğrulamasını tamamlayınız.',
    loggingIn: 'Giriş yapılıyor...',
    registering: 'Hesap oluşturuluyor ve sunucu hazırlanıyor...',

    myServers: 'Sunucu Filosu',
    myServersDesc: 'Bağlı VDS ve VPS sunucularınızın gerçek zamanlı görünümü.',
    searchServers: 'Sunucu adı, IP veya alan adına göre ara...',
    filterAll: 'Tüm Sunucular',
    filterOnline: 'Çevrimiçi',
    filterOffline: 'Çevrimdışı / Durduruldu',
    noServersFound: 'Henüz bağlı sunucu bulunmuyor.',
    noServersMatching: 'Arama kriterlerinize uygun sunucu bulunamadı.',
    connectFirstServer: 'İlk Sunucunuzu Bağlayın',
    serverCardVcpu: 'vCPU',
    serverCardRam: 'RAM',
    serverCardDisk: 'NVMe',
    serverCardBw: 'Trafik',
    serverCardOwnerBadge: 'Sahip',
    serverCardMemberBadge: 'Üye Erişimi',
    serverStatusOnline: 'Çevrimiçi',
    serverStatusOffline: 'Çevrimdışı',
    serverStatusRebooting: 'Yeniden Başlatılıyor',
    serverStatusStopped: 'Durduruldu',

    connectModalTitle: 'Yeni VDS / VPS Bağla',
    connectModalDesc: 'Mevcut bir Linux sunucusunu Flux Hosting paneline dahil edin.',
    serverName: 'Sunucu Adı / Etiketi',
    serverNamePlaceholder: 'Örn: Frankfurt Web Sunucusu 01',
    hostname: 'Sunucu Hostname',
    hostnamePlaceholder: 'Örn: node01.ornek.com',
    ipAddress: 'Genel IPv4 Adresi',
    ipAddressPlaceholder: 'Örn: 185.193.124.42',
    privateIp: 'Özel IPv4 (İsteğe Bağlı)',
    privateIpPlaceholder: 'Örn: 10.0.4.12',
    ipv6Address: 'IPv6 Adresi (İsteğe Bağlı)',
    ipv6Placeholder: 'Örn: 2a01:4f8:c012::1',
    sshPort: 'SSH Portu',
    sshUser: 'SSH Kullanıcısı',
    authMethod: 'Kimlik Doğrulama Yöntemi',
    authMethodPassword: 'Şifre ile',
    authMethodKey: 'SSH Özel Anahtarı ile',
    passwordOrKey: 'SSH Şifresi veya Anahtarı',
    osDistribution: 'İşletim Sistemi',
    serverRegion: 'Veri Merkezi / Bölge',
    specsVcpu: 'vCPU Çekirdek Sayısı',
    specsRam: 'Bellek (RAM MB cinsinden)',
    specsDisk: 'Disk (NVMe GB cinsinden)',
    specsBandwidth: 'Aylık Trafik Kotası (TB)',
    btnConnectServer: 'Bağlantıyı Kur',
    connectingServer: 'Bağlantı Doğrulanıyor...',

    tabControlPanel: 'Kontrol Paneli',
    tabConsole: 'Konsol Terminali',
    tabFiles: 'Dosya Yöneticisi',
    tabNetwork: 'Ağ ve Güvenlik Duvarı',
    tabMembers: 'Erişim ve Üyeler',
    tabSettings: 'Sunucu Ayarları',
    tabActivity: 'Denetim Günlüğü',
    backToDashboard: 'Sunucu Listesine Dön',

    hardwareMetrics: 'Donanım Kullanımı',
    cpuUsage: 'İşlemci (CPU) Kullanımı',
    ramUsage: 'Bellek (RAM) Kullanımı',
    diskUsage: 'Disk Kullanımı',
    networkTraffic: 'Ağ Giriş/Çıkış',
    trafficIn: 'Gelen',
    trafficOut: 'Giden',
    uptime: 'Çalışma Süresi (Uptime)',
    loadAverage: 'Yük Ortalaması (1dk, 5dk, 15dk)',
    liveHardwareChart: 'Gerçek Zamanlı Donanım Yük Grafiği',
    powerControls: 'Güç Yönetimi',
    btnStart: 'Sunucuyu Başlat',
    btnGracefulReboot: 'Yeniden Başlat (Güvenli)',
    btnForceReboot: 'Zorla Yeniden Başlat',
    btnGracefulShutdown: 'Kapat (ACPI)',
    btnForceKill: 'Gücü Kes (Zorla Kapat)',
    confirmPowerAction: 'Güç İşlemini Onayla',
    confirmPowerDesc: 'Sunucu üzerinde bu güç işlemini gerçekleştirmek istediğinizden emin misiniz?',
    runningProcesses: 'Çalışan İşlemler (Process)',
    processesDesc: 'Sistem servisleri ve anlık kaynak tüketimleri.',
    procPid: 'PID',
    procUser: 'Kullanıcı',
    procCpu: 'CPU %',
    procMem: 'BELLEK %',
    procCommand: 'Komut',
    procStatus: 'Durum',
    procAction: 'İşlem',
    killProc: 'Görevi Sonlandır',

    consoleTitle: 'Etkileşimli Web Terminali',
    consoleDesc: 'Şifreli tünel üzerinden sunucuya doğrudan sanal TTY terminal bağlantısı.',
    consoleStatusConnected: 'Bağlandı (SSH TTY)',
    consoleStatusDisconnected: 'Bağlantı Kesildi',
    consolePlaceholder: 'Bash komutu yazıp Enter tuşuna basın (örn: top, df -h, systemctl, ls, ufw)...',
    btnClear: 'Ekranı Temizle',
    btnCopy: 'Günlüğü Kopyala',
    btnFullscreen: 'Tam Ekran',
    btnExitFullscreen: 'Tam Ekrandan Çık',
    quickCommands: 'Hızlı Kısayollar:',
    copiedToClipboard: 'Panoya kopyalandı.',

    filesTitle: 'Sunucu Dosya Yöneticisi',
    filesDesc: 'Linux dosya sistemini gerçek zamanlı inceleyin, düzenleyin ve izinleri yapılandırın.',
    currentDirectory: 'Dizin:',
    btnNewFile: 'Yeni Dosya',
    btnNewFolder: 'Yeni Klasör',
    btnUpload: 'Dosya Yükle',
    fileName: 'Dosya Adı',
    fileSize: 'Boyut',
    filePermissions: 'İzinler',
    fileOwner: 'Sahip / Grup',
    fileModified: 'Son Değiştirilme',
    fileActions: 'İşlemler',
    editFile: 'Metni Düzenle',
    renameFile: 'Yeniden Adlandır / Taşı',
    changePermissions: 'Chmod İzinleri',
    deleteFile: 'Sil',
    downloadFile: 'İndir',
    confirmDeleteFile: 'Dosyayı Sil',
    confirmDeleteFileDesc: 'Bu dosya veya klasörü kalıcı olarak silmek istediğinizden emin misiniz?',
    fileEditorTitle: 'Metin Dosyası Düzenleyici',
    btnSaveFile: 'Değişiklikleri Kaydet (Ctrl+S)',
    savingFile: 'Dosya kaydediliyor...',
    chmodModalTitle: 'Dosya İzinlerini Değiştir (chmod)',
    chmodNumeric: 'Oktal İzin Değeri (örn: 0755, 0644, 0600)',
    uploadModalTitle: 'Sunucuya Dosya Yükle',
    dragDropFiles: 'Metin veya yapılandırma dosyalarını buraya sürükleyin ya da seçin',

    networkTitle: 'Ağ Ayarları ve Güvenlik Kuralları',
    networkDesc: 'Atanmış IP adresleri, port yönlendirmeleri, UFW güvenlik duvarı ve DNS kayıtları.',
    assignedIps: 'Atanmış IP Adresleri',
    publicIpv4: 'Genel IPv4',
    privateIpv4: 'Özel IPv4',
    publicIpv6: 'Genel IPv6',
    portForwarding: 'Port Yönlendirme ve NAT Tahsisleri',
    portForwardingDesc: 'Dış portları doğrudan dahili servislere yönlendirin.',
    btnAddPort: 'Port Yönlendirme Ekle',
    publicPort: 'Dış Port',
    internalPort: 'İç Port',
    protocol: 'Protokol',
    description: 'Açıklama',
    firewallRules: 'Güvenlik Duvarı Kuralları (UFW / iptables)',
    firewallRulesDesc: 'Gelen paketleri izin ver (ALLOW) veya engelle (DENY) olarak filtreleyin.',
    ufwStatus: 'UFW Servisi: Aktif',
    btnAddRule: 'Kural Ekle',
    ruleAction: 'Eylem (ALLOW / DENY)',
    ruleProtocol: 'Protokol',
    rulePort: 'Port / Port Aralığı',
    ruleSource: 'Kaynak IP / Alt Ağ (CIDR)',
    ruleComment: 'Açıklama',
    dnsManagement: 'DNS Bölge Kayıtları',
    dnsManagementDesc: 'Sunucuya bağlı alan adları için DNS kayıtlarını yönetin.',
    btnAddDns: 'DNS Kaydı Ekle',
    dnsType: 'Kayıt Türü (A, AAAA, CNAME, TXT, MX)',
    dnsName: 'Kayıt Adı / Host',
    dnsValue: 'Hedef Değer / IP',
    dnsTtl: 'TTL (Saniye)',
    dnsPriority: 'Öncelik',

    membersTitle: 'Erişim Kontrolü ve Ekip Üyeleri (RBAC)',
    membersDesc: 'Sadece sunucu sahibi üye ekleyebilir ve panel yetkilerini yapılandırabilir.',
    serverOwnerBadge: 'Birincil Sunucu Sahibi',
    btnAddMember: 'Kullanıcı Adı ile Üye Ekle',
    memberUsernameInput: 'Üye Kullanıcı Adı veya E-postası',
    memberUsernamePlaceholder: 'Kayıtlı kullanıcı adı veya e-posta girin...',
    memberPermissionsTitle: 'Üye Yetki İzinleri',
    permPower: 'Güç Yönetimi Yetkisi',
    permPowerDesc: 'Sunucuyu başlatabilir, yeniden başlatabilir ve kapatabilir.',
    permConsole: 'Konsol Terminali Yetkisi',
    permConsoleDesc: 'Web terminalini açabilir ve komut çalıştırabilir.',
    permFiles: 'Dosya Yöneticisi Yetkisi',
    permFilesDesc: 'Dosyaları inceleyebilir, düzenleyebilir ve yükleyebilir.',
    permNetwork: 'Ağ ve Güvenlik Duvarı',
    permNetworkDesc: 'Güvenlik duvarı kurallarını ve portları yönetebilir.',
    permViewOnly: 'Sadece Görüntüleme (Salt Okunur)',
    permViewOnlyDesc: 'Kullanıcıya sadece görüntüleme izni verir, işlem yetkilerini kısıtlar.',
    btnSavePermissions: 'İzinleri Güncelle',
    btnRemoveMember: 'Yetkiyi Kaldır',
    confirmRemoveMember: 'Üye Erişimini Kaldır',
    confirmRemoveMemberDesc: 'Bu üyenin sunucu yönetim yetkilerini iptal etmek istediğinizden emin misiniz?',
    onlyOwnerCanManage: 'Yalnızca sunucu sahibi yeni üye ekleyebilir ve izinleri değiştirebilir.',

    serverSettingsTitle: 'Sunucu Parametreleri ve Bilgileri',
    serverSettingsDesc: 'Sunucu hostname, SSH portu ve donanım özelliklerini güncelleyin.',
    saveSettingsBtn: 'Yapılandırmayı Kaydet',
    dangerZone: 'Tehlikeli Bölge',
    dangerZoneDesc: 'Geri alınamaz sunucu işlemleri.',
    deleteServerBtn: 'Sunucu Bağlantısını Sil',
    confirmDeleteServer: 'Sunucuyu Sil',
    confirmDeleteServerDesc: 'Bu işlem sunucuyu Flux panelinizden tamamen kaldıracaktır. Bu işlem geri alınamaz.',

    smtpModalTitle: 'SMTP E-Posta Servisi Yapılandırması',
    smtpModalDesc: 'Doğrulama e-postaları, şifre sıfırlama ve güvenlik bildirimleri için SMTP sunucusunu yapılandırın.',
    smtpHost: 'SMTP Sunucu Host',
    smtpPort: 'SMTP Portu (örn: 587, 465, 25)',
    smtpSecureTls: 'SSL/TLS Kullanımı',
    smtpUsername: 'SMTP Kullanıcı Adı',
    smtpPassword: 'SMTP Şifresi',
    smtpFromName: 'Gönderici Görünen Adı',
    smtpFromEmail: 'Gönderici E-posta Adresi',
    btnSaveSmtp: 'SMTP Ayarlarını Kaydet',
    btnTestSmtp: 'Bağlantıyı Test Et',
    smtpTesting: 'SMTP Bağlantısı Test Ediliyor...',
    smtpTestRecipient: 'Test E-postasının Gönderileceği Adres:',
    smtpDiagnosticLogs: 'Tanı ve Bağlantı Günlüğü:',
    emailHistoryTab: 'Giden Posta Geçmişi',
    smtpConfigTab: 'Bağlantı Ayarları',
    noEmailLogs: 'Henüz gönderilmiş e-posta kaydı yok.',
    recipient: 'Alıcı',
    subject: 'Konu',
    status: 'Durum',
    date: 'Tarih',

    cancel: 'İptal',
    delete: 'Sil',
    save: 'Değişiklikleri Kaydet',
    confirm: 'Onayla',
    close: 'Kapat',
    loading: 'İşleniyor...',
    success: 'İşlem başarıyla tamamlandı.',
    error: 'Bir hata oluştu.',
    copied: 'Kopyalandı!',
  },
};
