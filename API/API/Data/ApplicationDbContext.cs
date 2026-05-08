using Microsoft.EntityFrameworkCore;
using API.Models;

namespace API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<SubjectConfig> SubjectConfigs { get; set; }
        public DbSet<Paper> Papers { get; set; }
        public DbSet<Section> Sections { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<ExaminerExpertise> ExaminerExpertises { get; set; }
        public DbSet<Script> Scripts { get; set; }
        public DbSet<Marking> Markings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Department configuration
            modelBuilder.Entity<Department>()
                .HasKey(d => d.DepartmentId);
            modelBuilder.Entity<Department>()
                .HasMany(d => d.SubjectConfigs)
                .WithOne(sc => sc.Department)
                .HasForeignKey(sc => sc.DepartmentId)
                .OnDelete(DeleteBehavior.Cascade);

            // User configuration
            modelBuilder.Entity<User>()
                .HasKey(u => u.Id);
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
            modelBuilder.Entity<User>()
                .HasOne(u => u.Department)
                .WithMany()
                .HasForeignKey(u => u.DepartmentId)
                .OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<User>()
                .HasMany(u => u.Expertise)
                .WithOne(ee => ee.Examiner)
                .HasForeignKey(ee => ee.ExaminerId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<User>()
                .HasMany(u => u.AssignedScripts)
                .WithOne(s => s.AssignedExaminer)
                .HasForeignKey(s => s.AssignedExaminerId)
                .OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<User>()
                .HasMany(u => u.Markings)
                .WithOne(m => m.Examiner)
                .HasForeignKey(m => m.ExaminerId)
                .OnDelete(DeleteBehavior.Cascade);

            // SubjectConfig configuration
            modelBuilder.Entity<SubjectConfig>()
                .HasKey(sc => sc.Id);
            modelBuilder.Entity<SubjectConfig>()
                .HasMany(sc => sc.Papers)
                .WithOne(p => p.SubjectConfig)
                .HasForeignKey(p => p.SubjectConfigId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<SubjectConfig>()
                .HasMany(sc => sc.Sections)
                .WithOne(s => s.SubjectConfig)
                .HasForeignKey(s => s.SubjectConfigId)
                .OnDelete(DeleteBehavior.Cascade);

            // Paper configuration
            modelBuilder.Entity<Paper>()
                .HasKey(p => p.Id);
            modelBuilder.Entity<Paper>()
                .HasIndex(p => p.PaperCode)
                .IsUnique();
            modelBuilder.Entity<Paper>()
                .HasMany(p => p.Sections)
                .WithOne(s => s.Paper)
                .HasForeignKey(s => s.PaperId)
                .OnDelete(DeleteBehavior.Cascade);

            // ExaminerExpertise configuration
            modelBuilder.Entity<ExaminerExpertise>()
                .HasKey(ee => ee.Id);
            modelBuilder.Entity<ExaminerExpertise>()
                .HasOne(ee => ee.Examiner)
                .WithMany(u => u.Expertise)
                .HasForeignKey(ee => ee.ExaminerId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<ExaminerExpertise>()
                .HasOne(ee => ee.Department)
                .WithMany()
                .HasForeignKey(ee => ee.DepartmentId)
                .OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<ExaminerExpertise>()
                .HasIndex(ee => new { ee.ExaminerId, ee.DepartmentId })
                .IsUnique();

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
                .HasKey(q => q.Id);

            // Script configuration
            modelBuilder.Entity<Script>()
                .HasKey(s => s.Id);
            modelBuilder.Entity<Script>()
                .HasIndex(s => s.ScriptId)
                .IsUnique();
            modelBuilder.Entity<Script>()
                .HasOne(s => s.Paper)
                .WithMany()
                .HasForeignKey(s => s.PaperId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Script>()
                .HasOne(s => s.AssignedExaminer)
                .WithMany(u => u.AssignedScripts)
                .HasForeignKey(s => s.AssignedExaminerId)
                .OnDelete(DeleteBehavior.SetNull);

            // Marking configuration
            modelBuilder.Entity<Marking>()
                .HasKey(m => m.Id);
            modelBuilder.Entity<Marking>()
                .HasOne(m => m.Script)
                .WithMany()
                .HasForeignKey(m => m.ScriptId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Marking>()
                .HasOne(m => m.Examiner)
                .WithMany(u => u.Markings)
                .HasForeignKey(m => m.ExaminerId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Marking>()
                .HasOne(m => m.Department)
                .WithMany()
                .HasForeignKey(m => m.DepartmentId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
