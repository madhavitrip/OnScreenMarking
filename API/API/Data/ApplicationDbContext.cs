using Microsoft.EntityFrameworkCore;
using API.Models;

namespace API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // DbSet entries for all models
        public DbSet<User> Users { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<University> Universities { get; set; }
        public DbSet<Subject> Subjects { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<Paper> Papers { get; set; }
        public DbSet<Section> Sections { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<QuestionMark> QuestionMarks { get; set; }
        public DbSet<ExaminerExpertise> ExaminerExpertises { get; set; }
        public DbSet<Script> Scripts { get; set; }
        public DbSet<Allocation> Allocations { get; set; }
        public DbSet<Marking> Markings { get; set; }
        public DbSet<PaperExaminer> PaperExaminers { get; set; }
        public DbSet<EventLog> EventLogs { get; set; }
        public DbSet<ErrorLog> ErrorLogs { get; set; }
        public DbSet<SubjectPaper> SubjectPapers { get; set; }
        public DbSet<DepartmentSubject> DepartmentSubjects { get; set; }
       
        public DbSet<Invitation> Invitations { get; set; }
        public DbSet<Role> Roles { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // University configuration
            modelBuilder.Entity<University>()
                .HasKey(u => u.UniversityId);
            modelBuilder.Entity<University>()
                .HasMany(u => u.Departments)
                .WithOne(d => d.University)
                .HasForeignKey(d => d.UniversityId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<University>()
                .HasMany(u => u.Projects)
                .WithOne(p => p.University)
                .HasForeignKey(p => p.UniversityId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<University>()
                .HasMany(u => u.Users)
                .WithOne(u => u.University)
                .HasForeignKey(u => u.UniversityId)
                .OnDelete(DeleteBehavior.Cascade);

            // Department configuration
            modelBuilder.Entity<Department>()
                .HasKey(d => d.DepartmentId);

            // User configuration
            modelBuilder.Entity<User>()
                .HasKey(u => u.Id);
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
            modelBuilder.Entity<User>()
                .HasOne(u => u.University)
                .WithMany(u => u.Users)
                .HasForeignKey(u => u.UniversityId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<User>()
                .HasMany(u => u.Expertise)
                .WithOne(ee => ee.Examiner)
                .HasForeignKey(ee => ee.ExaminerId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<User>()
                .HasMany(u => u.Allocations)
                .WithOne(a => a.Examiner)
                .HasForeignKey(a => a.ExaminerId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<User>()
                .HasMany(u => u.Markings)
                .WithOne(m => m.Examiner)
                .HasForeignKey(m => m.ExaminerId)
                .OnDelete(DeleteBehavior.Cascade);

            // Session configuration
            modelBuilder.Entity<Session>()
                .HasKey(s => s.SessionId);
            modelBuilder.Entity<Session>()
                .HasMany(s => s.Projects)
                .WithOne(p => p.Session)
                .HasForeignKey(p => p.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            // Project configuration
            modelBuilder.Entity<Project>()
                .HasKey(p => p.ProjectId);
            modelBuilder.Entity<Project>()
                .HasMany(p => p.Papers)
                .WithOne(p => p.Project)
                .HasForeignKey(p => p.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // Subject configuration
            modelBuilder.Entity<Subject>()
                .HasKey(s => s.SubjectId);
            modelBuilder.Entity<DepartmentSubject>()
    .HasOne(ds => ds.Department)
    .WithMany(d => d.DepartmentSubjects)
    .HasForeignKey(ds => ds.DepartmentId)
    .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<DepartmentSubject>()
    .HasOne(ds => ds.Subject)
    .WithMany(s => s.DepartmentSubjects)
    .HasForeignKey(ds => ds.SubjectId)
    .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<SubjectPaper>()
    .HasOne(sp => sp.Paper)
    .WithMany(p => p.SubjectPapers)
    .HasForeignKey(sp => sp.PaperId)
    .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<SubjectPaper>()
    .HasOne(sp => sp.Subject)
    .WithMany(s => s.SubjectPapers)
    .HasForeignKey(sp => sp.SubjectId)
    .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Subject>()
                .HasMany(s => s.ExaminerExpertises)
                .WithOne(ee => ee.Subject)
                .HasForeignKey(ee => ee.SubjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // Paper configuration
            modelBuilder.Entity<Paper>()
                .HasKey(p => p.PaperId);
            modelBuilder.Entity<Paper>()
                .HasIndex(p => p.PaperCode)
                .IsUnique();
            modelBuilder.Entity<Paper>()
                .HasMany(p => p.Sections)
                .WithOne(s => s.Paper)
                .HasForeignKey(s => s.PaperId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Paper>()
                .HasMany(p => p.Scripts)
                .WithOne(s => s.Paper)
                .HasForeignKey(s => s.PaperId)
                .OnDelete(DeleteBehavior.Cascade);

            // Section configuration
            modelBuilder.Entity<Section>()
                .HasKey(s => s.Id);
            modelBuilder.Entity<Section>()
                .HasMany(s => s.Questions)
                .WithOne(q => q.Section)
                .HasForeignKey(q => q.SectionId)
                .OnDelete(DeleteBehavior.Cascade);

            // Question configuration
            modelBuilder.Entity<Question>()
                .HasKey(q => q.QuestionId);
            modelBuilder.Entity<Question>()
                .HasMany(q => q.QuestionMarks)
                .WithOne(qm => qm.Question)
                .HasForeignKey(qm => qm.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);

            // ExaminerExpertise configuration
            modelBuilder.Entity<ExaminerExpertise>()
                .HasKey(ee => ee.Id);
            modelBuilder.Entity<ExaminerExpertise>()
                .HasIndex(ee => new { ee.ExaminerId, ee.SubjectId })
                .IsUnique();

            // Script configuration
            modelBuilder.Entity<Script>()
                .HasKey(s => s.Id);
            modelBuilder.Entity<Script>()
                .HasIndex(s => s.ScriptId)
                .IsUnique();
            modelBuilder.Entity<Script>()
                .HasMany(s => s.Allocations)
                .WithOne(a => a.Script)
                .HasForeignKey(a => a.ScriptId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Script>()
                .HasMany(s => s.Markings)
                .WithOne(m => m.Script)
                .HasForeignKey(m => m.ScriptId)
                .OnDelete(DeleteBehavior.Cascade);

            // Allocation configuration
            modelBuilder.Entity<Allocation>()
                .HasKey(a => a.AllocationId);
            modelBuilder.Entity<Allocation>()
                .HasOne(a => a.Script)
                .WithMany(s => s.Allocations)
                .HasForeignKey(a => a.ScriptId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Allocation>()
                .HasOne(a => a.Examiner)
                .WithMany(u => u.Allocations)
                .HasForeignKey(a => a.ExaminerId)
                .OnDelete(DeleteBehavior.Cascade);

            // Marking configuration
            modelBuilder.Entity<Marking>()
                .HasKey(m => m.Id);
            modelBuilder.Entity<Marking>()
                .HasOne(m => m.Script)
                .WithMany(s => s.Markings)
                .HasForeignKey(m => m.ScriptId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Marking>()
                .HasOne(m => m.Examiner)
                .WithMany(u => u.Markings)
                .HasForeignKey(m => m.ExaminerId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Marking>()
                .HasOne(m => m.Allocation)
                .WithMany()
                .HasForeignKey(m => m.AllocationId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Marking>()
                .HasMany(m => m.QuestionMarks)
                .WithOne(qm => qm.Marking)
                .HasForeignKey(qm => qm.MarkingId)
                .OnDelete(DeleteBehavior.Cascade);

            // PaperExaminer configuration
            modelBuilder.Entity<PaperExaminer>()
                .HasKey(pe => pe.Id);
            modelBuilder.Entity<PaperExaminer>()
                .HasOne(pe => pe.Paper)
                .WithMany()
                .HasForeignKey(pe => pe.PaperId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<PaperExaminer>()
                .HasOne(pe => pe.Examiner)
                .WithMany()
                .HasForeignKey(pe => pe.ExaminerId)
                .OnDelete(DeleteBehavior.Cascade);

            // QuestionMark configuration
            modelBuilder.Entity<QuestionMark>()
                .HasKey(qm => qm.Id);

            // Invitation configuration
            modelBuilder.Entity<Invitation>()
                .HasKey(i => i.Id);
            modelBuilder.Entity<Invitation>()
                .HasOne(i => i.University)
                .WithMany()
                .HasForeignKey(i => i.UniversityId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Invitation>()
                .HasOne(i => i.Department)
                .WithMany()
                .HasForeignKey(i => i.DepartmentId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
