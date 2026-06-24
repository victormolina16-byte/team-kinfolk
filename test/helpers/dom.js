// Builds the minimal DOM skeleton that renderSlate() reads/writes,
// mirroring the elements in index.html's <header> and <main>.
export function mountSkeleton() {
  document.body.innerHTML = `
    <header>
      <div class="timestamp" id="timestamp">—</div>
      <div class="slate-date" id="slateDate">—</div>
      <div class="meta-pill" id="playCount"><strong>—</strong> plays</div>
      <div class="meta-pill" id="gradeBreakdown">—</div>
    </header>
    <main id="slateContainer">
      <div class="empty"></div>
    </main>
  `;
}

export const $ = (id) => document.getElementById(id);
