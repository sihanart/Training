// The per-pod controller assignment, and the CLI that follows from it.
//
// One definition feeds three outputs — the Lab topology diagram, the "Golden
// config" section on the page, and the configs/*.txt files. They cannot drift
// from each other, which is the whole point: a pod told to paste a config that
// disagrees with the diagram loses lab time to a hunt that is not the lesson.

const OCTETS = /^(\d+\.\d+\.\d+)\.(\d+)\/24$/;

/** "POD 1" -> "pod1" — used for the tab id and the configs/ file name. */
export const podId = (label) => label.toLowerCase().replace(/[^a-z0-9]+/g, '');

/**
 * Expands the event's lab block into one row per pod, with every value the
 * diagram and the CLI need already worked out.
 */
export function labPods(lab) {
  if (!lab) return [];
  return lab.pods.map((p) => {
    const m = OCTETS.exec(p.subnet);
    if (!m) throw new Error(`lab pod "${p.label}": subnet must be a /24, got "${p.subnet}"`);
    const [, prefix] = m;
    return {
      ...p,
      id: podId(p.label),
      teacher: p.role === 'teacher',
      // Goes on the device as the SVI description, so it says which set it is,
      // not just which number — that is what you read back over someone's shoulder.
      role: p.role === 'teacher' ? 'Instructor / Demo' : 'Student',
      prefix,
      gateway: `${prefix}.1`,
      poolName: `POOL-VLAN${p.vlan}`,
      excludeLow: [`${prefix}.1`, `${prefix}.${lab.poolFrom - 1}`],
      excludeHigh: [`${prefix}.${lab.poolTo + 1}`, `${prefix}.254`],
      poolRange: `.${lab.poolFrom} – .${lab.poolTo}`,
      network: `${prefix}.0`,
    };
  });
}

/**
 * The config a pod pastes into its own controller.
 *
 * Two renderings of the same values, because the two places it appears are read
 * differently: the page block is what you select and paste, so it stays tight;
 * the configs/ file is what you read on a laptop beside the console, so it keeps
 * the step headings and the verification commands. Only the presentation
 * differs — every address in both comes from the one pod row.
 */
export function podConfig(lab, pod, { annotated = false } = {}) {
  const step = (n, title) => (annotated ? ['', `! ---------- ${n}) ${title} ----------`] : []);
  const head = annotated
    ? [
        '! =====================================================================',
        `! ${pod.label} - ${pod.role}`,
        `! ${lab.controller}  |  ${lab.controllerOs}`,
        `! Controller MGMT : ${pod.mgmt}`,
        `! AP VLAN         : ${pod.vlan}   Subnet: ${pod.subnet}`,
        '! =====================================================================',
      ]
    : [
        `! ${pod.label} · ${lab.controller} · ${lab.controllerOs}`,
        `! Controller MGMT : ${pod.mgmt}      AP VLAN : ${pod.vlan}      Subnet : ${pod.subnet}`,
      ];

  return [
    ...head,
    '',
    'configure terminal',
    ...(annotated ? [] : ['']),
    ...step(1, 'VLAN + SVI (gateway ของ AP VLAN)'),
    `vlan ${pod.vlan}`,
    '!',
    `interface vlan ${pod.vlan}`,
    ` description "${pod.label} - ${pod.role} AP VLAN"`,
    ` ip address ${pod.gateway} 255.255.255.0`,
    ' ip nat inside',
    ' operstate up',
    '!',
    ...step(2, 'กัน IP ที่ไม่ให้แจก'),
    `ip dhcp excluded-address ${pod.excludeLow[0]} ${pod.excludeLow[1]}`,
    `ip dhcp excluded-address ${pod.excludeHigh[0]} ${pod.excludeHigh[1]}`,
    ...(annotated ? [] : ['!']),
    ...step(3, 'DHCP pool'),
    `ip dhcp pool ${pod.poolName}`,
    ` network ${pod.network} 255.255.255.0`,
    ` default-router ${pod.gateway}`,
    ` dns-server ${lab.dns}`,
    ` domain-name ${lab.domain}`,
    ` lease 0 ${lab.leaseHours} 0`,
    '!',
    ...step(4, 'เปิดบริการ DHCP + บันทึก'),
    'service dhcp',
    'write memory',
    ...(annotated
      ? [
          '',
          '! ---------- 5) ตรวจสอบ ----------',
          '!  show ip interface brief',
          '!  show ip dhcp binding',
          '!  show ip dhcp statistics',
          '!  show ap database',
          '!  show ap active',
          `!  show datapath session table | include ${pod.prefix}.`,
        ]
      : []),
  ].join('\n');
}
