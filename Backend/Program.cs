using System.Text;
using Backend.Models;
using Backend.Data;
using Backend.WebSockets;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
var Configuration = builder.Configuration;

builder.Services.AddDbContext<ApplicationDBContext>(options => options.UseNpgsql(Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddIdentity<User, IdentityRole>().AddEntityFrameworkStores<ApplicationDBContext>().AddDefaultTokenProviders();
var jwtSettings = Configuration.GetSection("JwtSettings");
var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"]);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddSingleton<StockWebSocketHandler>();
builder.Services.AddHostedService<StockScrapingService>();
builder.Services.AddHostedService<StockStorageService>();
builder.Services.AddControllers();
builder.Services.AddLogging();
builder.Services.AddTransient<EmailService>();
builder.Services.AddTransient<UserService>();

// Configure Npgsql to use dynamic JSON serialization
NpgsqlConnection.GlobalTypeMapper.EnableDynamicJson();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAllOrigins");
app.UseAuthentication();
app.UseAuthorization();
app.UseWebSockets();

app.MapControllers();

app.Use(async (context, next) =>
{
    if (context.Request.Path == "/stocks")
    {
        if (context.WebSockets.IsWebSocketRequest)
        {
            var webSocketHandler = app.Services.GetRequiredService<StockWebSocketHandler>();
            var webSocket = await context.WebSockets.AcceptWebSocketAsync();
            await webSocketHandler.HandleWebSocketAsync(context, webSocket);
        }
        else
        {
            context.Response.StatusCode = 400;
        }
    }
    else
    {
        await next();
    }
});

app.Run();
