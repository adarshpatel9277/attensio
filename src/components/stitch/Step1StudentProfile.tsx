import React, { useState, useRef } from 'react';
import { DayAppSettings } from '../../types';

interface Step1StudentProfileProps {
  initialSettings: DayAppSettings;
  onNext: (data: Partial<DayAppSettings>) => void;
  onBack: () => void;
  onSkip: () => void;
}

export const Step1StudentProfile: React.FC<Step1StudentProfileProps> = ({
  initialSettings,
  onNext,
  onBack,
  onSkip,
}) => {
  const [name, setName] = useState(initialSettings.studentName || '');
  const [college, setCollege] = useState(initialSettings.collegeName || '');
  const [course, setCourse] = useState(initialSettings.courseName || '');
  const [semester, setSemester] = useState(initialSettings.semester || 1);
  const [avatarUrl, setAvatarUrl] = useState(initialSettings.avatarUrl || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onNext({
      studentName: name.trim(),
      collegeName: college.trim(),
      courseName: course.trim(),
      semester,
      avatarUrl,
    });
  };

  return (
    <div className="bg-surface min-h-screen font-body-md text-on-surface flex flex-col antialiased selection:bg-rose-tint selection:text-primary">
      {/* Fixed Header */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-space-sm">
            <button
              aria-label="Go back"
              onClick={onBack}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 rounded-full text-on-surface hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Target Criteria Setup
            </span>
          </div>
          <div className="flex items-center gap-space-sm">
            <button
              onClick={onSkip}
              className="min-w-[44px] min-h-[44px] px-3 flex items-center justify-center rounded-full bg-rose-subtle text-primary font-label-md text-label-md hover:bg-rose-tint active:scale-95 transition-all cursor-pointer"
              type="button"
            >
              Skip
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-on-primary text-[18px]">
                  person
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col relative w-full pt-20 pb-safe bg-surface min-h-screen max-w-md mx-auto px-margin">
        <div className="flex flex-col w-full pb-space-xl">
          {/* Progress & Stepper Header */}
          <div className="flex flex-col gap-space-xs mt-space-sm mb-space-md">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-subtle text-primary font-label-md text-label-md">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Step 1 of 3 • Basic Details
              </span>
              <span className="font-label-md text-label-md text-secondary">33% complete</span>
            </div>
            {/* Stepper Indicator Bars */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="h-1.5 rounded-full bg-primary transition-all duration-300" />
              <div className="h-1.5 rounded-full bg-surface-container transition-all duration-300" />
              <div className="h-1.5 rounded-full bg-surface-container transition-all duration-300" />
            </div>
          </div>

          {/* Editorial Headline Section */}
          <div className="flex flex-col mb-space-lg">
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
              Tell us a bit about you
            </h1>
            <p className="font-body-md text-body-md text-secondary mt-1">
              Help personalize your attendance reports and timetable.
            </p>
          </div>

          {/* Interactive Profile Photo Picker */}
          <div className="flex flex-col items-center justify-center mb-space-lg">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-24 h-24 rounded-full bg-surface-container-low shadow-sm flex flex-col items-center justify-center transition-all duration-200 group-hover:scale-105 group-active:scale-95 overflow-hidden">
                {avatarUrl ? (
                  <img
                    alt="Student Profile Preview"
                    className="w-full h-full object-cover"
                    src={avatarUrl}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <div className="w-9 h-9 rounded-full bg-rose-subtle text-primary flex items-center justify-center mb-1">
                      <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-bold leading-tight">
                      ADD PHOTO
                    </span>
                  </div>
                )}
              </div>
              <button
                aria-label="Upload photo"
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-on-primary shadow-md flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              </button>
              <input
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                type="file"
                onChange={handlePhotoUpload}
              />
            </div>
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className="material-symbols-outlined text-[14px] text-tertiary">
                check_circle
              </span>
              <span className="font-label-sm text-label-sm text-secondary">
                Stored offline on phone • Optional
              </span>
            </div>
          </div>

          {/* Form Fields Card */}
          <form
            onSubmit={handleSubmit}
            className="bg-surface-card rounded-lg p-space-lg shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04),0_2px_6px_-1px_rgba(15,23,42,0.02)] flex flex-col gap-space-md mb-space-md"
          >
            {/* Full Name Input */}
            <div className="flex flex-col gap-1.5">
              <label
                className="font-label-md text-label-md text-on-surface flex items-center gap-1 font-semibold"
                htmlFor="student-name"
              >
                <span>Your Full Name</span>
                <span className="text-primary font-bold">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-secondary text-[20px] pointer-events-none">
                  badge
                </span>
                <input
                  id="student-name"
                  className="w-full pl-11 pr-4 py-3 rounded-full bg-surface-recessed text-on-surface font-body-md text-body-md placeholder:text-secondary focus:bg-surface-card focus:outline-none focus:shadow-[0_0_0_2px_rgba(185,5,56,0.2)] transition-all"
                  placeholder="e.g., Adarsh Sharma"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* College / University Input */}
            <div className="flex flex-col gap-1.5">
              <label
                className="font-label-md text-label-md text-on-surface flex items-center gap-1 font-semibold"
                htmlFor="college-name"
              >
                <span>College / University</span>
                <span className="text-primary font-bold">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-secondary text-[20px] pointer-events-none">
                  account_balance
                </span>
                <input
                  id="college-name"
                  className="w-full pl-11 pr-4 py-3 rounded-full bg-surface-recessed text-on-surface font-body-md text-body-md placeholder:text-secondary focus:bg-surface-card focus:outline-none focus:shadow-[0_0_0_2px_rgba(185,5,56,0.2)] transition-all"
                  placeholder="e.g., National Institute of Technology"
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Course / Degree Input */}
            <div className="flex flex-col gap-1.5">
              <label
                className="font-label-md text-label-md text-on-surface flex items-center gap-1 font-semibold"
                htmlFor="course-name"
              >
                <span>Course / Degree</span>
                <span className="text-primary font-bold">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-secondary text-[20px] pointer-events-none">
                  school
                </span>
                <input
                  id="course-name"
                  className="w-full pl-11 pr-4 py-3 rounded-full bg-surface-recessed text-on-surface font-body-md text-body-md placeholder:text-secondary focus:bg-surface-card focus:outline-none focus:shadow-[0_0_0_2px_rgba(185,5,56,0.2)] transition-all"
                  placeholder="e.g., B.Tech Computer Science"
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Semester Selector Segment */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md text-on-surface font-semibold">
                  Current Semester / Year
                </label>
                <span className="font-label-sm text-label-sm text-primary font-bold">
                  Sem {semester} Selected
                </span>
              </div>
              {/* Horizontal Scrollable Pill Array */}
              <div
                aria-label="Select Semester"
                className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar -mx-1 px-1"
                role="radiogroup"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => {
                  const isSelected = semester === s;
                  return (
                    <button
                      key={s}
                      aria-checked={isSelected}
                      onClick={() => setSemester(s)}
                      className={`shrink-0 px-4 py-2 rounded-full font-label-md text-label-md transition-all active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'bg-surface-recessed text-secondary hover:text-on-surface'
                      }`}
                      role="radio"
                      type="button"
                    >
                      Sem {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </form>

          {/* Trust & Privacy Assurance Chip */}
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-surface-container-low text-secondary mb-space-lg mx-auto max-w-sm">
            <span className="material-symbols-outlined text-[16px] text-tertiary">lock</span>
            <span className="font-label-md text-label-md text-on-surface-variant text-center">
              Your details are stored strictly in local phone storage.
            </span>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col gap-2 mt-auto">
            <button
              onClick={() => handleSubmit()}
              className="w-full h-12 rounded-full bg-primary text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-[0_8px_18px_-4px_rgba(185,5,56,0.32)] active:scale-[0.98] transition-all group cursor-pointer"
              type="button"
            >
              <span className="font-bold">Continue to Schedule</span>
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>
            <p className="font-body-sm text-body-sm text-center text-secondary">
              You can fine-tune subject names and target goals next.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
