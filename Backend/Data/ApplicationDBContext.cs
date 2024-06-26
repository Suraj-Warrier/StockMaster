using Backend.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Npgsql.EntityFrameworkCore.PostgreSQL;

namespace Backend.Data
{
    public class ApplicationDBContext : IdentityDbContext<User>
    {
        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options)
            : base(options)
        {
            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
        }

        public DbSet<Watchlist> Watchlists { get; set; }
        public DbSet<Stock> Stocks { get; set; }
        public DbSet<WatchlistStock> WatchlistStocks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Stock>()
                .Property(e => e.FiveMinData)
                .HasColumnType("jsonb");

            modelBuilder.Entity<Stock>()
                .Property(e => e.ThirtyMinData)
                .HasColumnType("jsonb");

            modelBuilder.Entity<Stock>()
                .Property(e => e.OneHourData)
                .HasColumnType("jsonb");

            modelBuilder.Entity<Stock>()
                .Property(e => e.OneDayData)
                .HasColumnType("jsonb");

            modelBuilder.Entity<Stock>()
                .Property(e => e.OneWeekData)
                .HasColumnType("jsonb");

            modelBuilder.Entity<WatchlistStock>()
                .HasKey(ws => new { ws.WatchlistId, ws.StockId });

            modelBuilder.Entity<WatchlistStock>()
                .HasOne(ws => ws.Watchlist)
                .WithMany(w => w.WatchlistStocks)
                .HasForeignKey(ws => ws.WatchlistId);

            modelBuilder.Entity<WatchlistStock>()
                .HasOne(ws => ws.Stock)
                .WithMany(s => s.WatchlistStocks)
                .HasForeignKey(ws => ws.StockId);

            modelBuilder.Entity<Watchlist>()
                .HasOne(w => w.User)
                .WithMany(u => u.Watchlists)
                .HasForeignKey(w => w.UserId);
        }
    }
}
