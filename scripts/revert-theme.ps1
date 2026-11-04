$exclude = 'CommunicationPage.tsx'
$files = Get-ChildItem -Path "$PSScriptRoot\..\src" -Recurse -Include *.tsx | Where-Object {
  $_.Name -ne $exclude -and $_.Name -ne 'GrayKpi.tsx'
}

$pairs = @(
  @('accent:   ''#0A0A0A''', 'accent:   ''#0584C7''')
  @('accent:  ''#0A0A0A''', 'accent:  ''#0584C7''')
  @('accent: ''#0A0A0A''', 'accent: ''#0584C7''')
  @('primary:   ''#0A0A0A''', 'primary:   ''#0F172A''')
  @('primary:  ''#0A0A0A''', 'primary:  ''#0F172A''')
  @('primary: ''#0A0A0A''', 'primary: ''#0F172A''')
  @('activeColor: ''#0A0A0A''', 'activeColor: ''#0584C7''')
  @('color: ''#0A0A0A''', 'color: ''#0584C7''')
  @('background: ''#0A0A0A''', 'background: ''#0584C7''')
  @('background: view === ''folder'' ? ''#0A0A0A''', 'background: view === ''folder'' ? ''#0F172A''')
  @('background: view === ''list'' ? ''#0A0A0A''', 'background: view === ''list'' ? ''#0F172A''')
  @('background: activeTab === t.key ? ''#0A0A0A''', 'background: activeTab === t.key ? ''#0F172A''')
  @('background: subTab === t.key ? ''#0A0A0A''', 'background: subTab === t.key ? ''#0F172A''')
  @('background: filter === f ? ''#0A0A0A''', 'background: filter === f ? ''#0F172A''')
  @('background: loading ? G.secondary : ''#0A0A0A''', 'background: loading ? G.secondary : ''#0F172A''')
  @('background: checking ? G.secondary : ''#0A0A0A''', 'background: checking ? G.secondary : ''#0F172A''')
  @('background: uploadReady ? ''#0A0A0A''', 'background: uploadReady ? ''#0F172A''')
  @('background: importing ? G.secondary : ''#0A0A0A''', 'background: importing ? G.secondary : ''#0F172A''')
  @('background: on ? ''#0A0A0A''', 'background: on ? ''#0584C7''')
  @('background: active ? ''#0A0A0A''', 'background: active ? ''#0584C7''')
  @('background: done ? ''#0A0A0A''', 'background: done ? ''#0584C7''')
  @('borderColor: active ? ''#0A0A0A''', 'borderColor: active ? ''#0584C7''')
  @('borderColor: ''#0A0A0A''', 'borderColor: ''#0584C7''')
  @('border: ''1px solid #0A0A0A''', 'border: ''1px solid #0584C7''')
  @('color: ''#404040''', 'color: ''#2563EB''')
  @('color: ''#525252''', 'color: ''#475569''')
  @('color: ''#737373''', 'color: ''#64748B''')
  @('color: ''#A3A3A3''', 'color: ''#94A3B8''')
  @('#404040', '#2563EB')
  @('#525252', '#475569')
  @('#737373', '#64748B')
  @('#A3A3A3', '#94A3B8')
  @('#E5E5E5', '#E2E8F0')
  @('#D4D4D4', '#CBD5E1')
  @('#FAFAFA', '#F8FAFC')
  @('#F5F5F5', '#EFF8FF')
  @('#262626', '#1E293B')
  @('CHART_COLORS = [''#0A0A0A'', ''#0A0A0A''', 'CHART_COLORS = [''#0584C7'', ''#0F172A''')
  @('gst: ''#525252''', 'gst: ''#3B82F6''')
  @('internal: ''#525252''', 'internal: ''#3B82F6''')
)

$count = 0
foreach ($file in $files) {
  $content = [System.IO.File]::ReadAllText($file.FullName)
  $newContent = $content
  foreach ($pair in $pairs) { $newContent = $newContent.Replace($pair[0], $pair[1]) }
  if ($newContent -ne $content) {
    [System.IO.File]::WriteAllText($file.FullName, $newContent)
    $count++
    Write-Output $file.Name
  }
}
Write-Output "Updated $count files"
